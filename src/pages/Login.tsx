import {IonButton, IonContent, IonPage} from '@ionic/react';
import {useEffect, useMemo, useState} from 'react';
import {Redirect} from 'react-router';
import {instance} from '../axios';
import Loader from '../components/Loader';
import {useUser} from '../context/UserContext';
import {environment} from '../environments/environment';
import {auth} from '../firebase';

// The "Login" page to which all unauthenticated users are redirected to
function Login() {
    const user = useUser();
    const { next, code, discordError } = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        // the login page also works as the redirect page for discord oauth

        // authorization code returned by discord in the search query after user authorises the site
        const code = params.get('code');

        // the url to redirect to after user succesfully logs in
        const next = params.get('next') || params.get('state') || '/';
        // the error , if any, returned by discord
        const discordError = params.get('error_description');
        return { code, next, discordError };
    }, []);

    const [error, setError] = useState(discordError);
    // loading state which stores whether an access token is being issued or not
    const [loading, setLoading] = useState(!!code);
    useEffect(() => {
        if (code && !error && !user) {
            // exchange authorization code given by discord for an access token which we can sign in with using firebase
            instance
                .post(
                    '/getToken',
                    { code },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                )
                .then(({ data }) => {
                    // console.log(data);
                    return auth.signInWithCustomToken(data.body);
                })
                .catch((e) => {
                    // console.log(e);
                    if (e.response?.status === 403)
                        setError("You need a proper role in Discord before accessing the site");
                    else setError('Something went wrong. Please try again');
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [code, error, user]);
    // if user is already authenticated redirect them to the last page they were on if any. or otherwise to the home page

    // if user is authenticated, redirect user to previous page
    return user ? (
        <Redirect to={next} />
    ) : (
        <IonPage>
            <IonContent>
                <div className="w-screen min-h-screen flex flex-col  justify-center items-center">
                    {!loading ? (
                        <>

                            {/*TODO: need to make this page more spicy ... !!! Show screenshot auth.. explain can't read discord msg's */}

                            <h3 className="text-white-500 my-4">Welcome to SOL Decoder</h3>
                            <br/>

                            <IonButton
                                onClick={() => {
                                    const params = new URLSearchParams();
                                    params.set(
                                        'redirect_uri',
                                        `${window.location.origin}/login`
                                    );
                                    params.set('state', next);
                                    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${
                                        environment.clientId
                                    }&response_type=code&scope=identify&${params.toString()}`;
                                }}
                            >
                                Login with Discord
                            </IonButton>

                            <p className="text-red-500 my-4 text-2xl">
                                {error}
                            </p>

                            <ul className="text-white-500 my-4">
                                <li>Please join <a href="https://discord.gg/tEa8ZTWv" style={{"textDecoration": "underline"}}>our Discord</a> to get access to the site</li>
                                <br/>
                                <li>In the future the site will be locked behing ownership of the NFT. Until the NFT releases, you can get access by being whitelisted</li>
                                <br/>
                                <li>View whitelisting requirements in the #whitelist-faq channel</li>
                            </ul>

                        </>

                    ) : (
                        <div className="h-48 w-48">
                            <Loader />
                        </div>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
}

export default Login;
