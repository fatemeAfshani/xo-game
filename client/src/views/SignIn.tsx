import axios from 'axios';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext.js';

type SignInInput = {
  username: string;
  password: string;
};
export default function SignIn() {
  const [userData, setUserData] = useState<SignInInput>({
    username: '',
    password: '',
  });
  const [signInError, setSignInError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { userToken, login } = useAuth();
  console.log('#### userToken', userToken);
  const redirectPath = location?.state?.path || '/';
  if (userToken) navigate(redirectPath);

  const clickHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      console.log('#### base url', import.meta.env.VITE_URL);

      const response = await axios({
        method: 'post',
        data: userData,
        url: `${import.meta.env.VITE_URL as string}/users/signin`,
      });
      login(response.data.accessToken);
      navigate(redirectPath, { replace: true });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message
        ? Array.isArray(error.response?.data?.message)
          ? error.response?.data?.message?.[0]
          : error.response?.data?.message
        : 'something went wrong';

      console.log('#### error', errorMessage);
      setSignInError(errorMessage);
    }
  };
  return (
    <div className="login template d-flex justify-content-center align-items-center vh-100 bg-white">
      <div className=" rounded p-5 bg-blue  ">
        <form onSubmit={clickHandler}>
          <h3 className="text-center">Sign In</h3>
          {signInError && (
            <div className="alert alert-danger" role="alert">
              {signInError}
            </div>
          )}

          <div className="my-3">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              placeholder=" username"
              className="form-control"
              onChange={(e) =>
                setUserData((preData) => {
                  return { ...preData, username: e.target.value };
                })
              }
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              placeholder=" password"
              className="form-control"
              onChange={(e) =>
                setUserData((preData) => {
                  return { ...preData, password: e.target.value };
                })
              }
            />
          </div>
          <div className="d-grid my-4">
            <button className="btn btn-dark rounded">Sign In</button>
          </div>
        </form>
        <p className="text-right">
          Don't have an account ? <Link to="/signup"> Click Here</Link>
        </p>
      </div>
    </div>
  );
}
