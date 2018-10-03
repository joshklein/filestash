import React from 'react';
import { Link } from 'react-router-dom';

import { Session } from '../model/';
import { Container, Loader, Icon } from '../components/';
import { memory } from '../helpers/';

import '../pages/error.scss';

export function LoggedInOnly(WrappedComponent){
    memory.set('user::authenticated', false);

    return class extends React.Component {
        constructor(props){
            super(props);
            this.state = {
                is_logged_in: memory.get('user::authenticated')
            };
        }

        componentDidMount(){
            if(this.state.is_logged_in === false){
                Session.currentUser().then((res) => {
                    if(res.is_authenticated === false){
                        this.props.error({message: "Authentication Required"});
                        return;
                    }
                    memory.set('user::authenticated', true);
                    this.setState({is_logged_in: true});
                }).catch((err) => {
                    if(err.code === "NO_INTERNET"){
                        this.setState({is_logged_in: true});
                        return;
                    }
                    this.props.error(err);
                });
            }
        }

        render(){
            if(this.state.is_logged_in === true){
                return <WrappedComponent {...this.props} />;
            }
            return null;
        }
    }
}


export function ErrorPage(WrappedComponent){
    return class extends React.Component {
        constructor(props){
            super(props);
            this.state = {
                error: null
            };
        }

        update(obj){
            this.setState({error: obj});
        }

        render(){
            if(this.state.error !== null){
                const message = this.state.error.message || "There is nothing in here";
                return (
                    <div>
                      <Link to="/" className="backnav">
                        <Icon name="arrow_left" />home
                      </Link>
                      <Container>
                        <div className="error-page">
                          <h1>Oops!</h1>
                          <h2>{message}</h2>
                        </div>
                      </Container>
                    </div>
                );
            }
            return (
                <WrappedComponent error={this.update.bind(this)} {...this.props} />
            );
        }
    }
}
