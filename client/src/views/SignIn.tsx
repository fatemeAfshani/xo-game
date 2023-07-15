import axios from 'axios';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext.js';
import { getErrorMessage } from '../utils.js';

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
  const { user, login } = useAuth();

  const redirectPath = location?.state?.path || '/';
  if (user?.token) navigate(redirectPath);

  const clickHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();

      const response = await axios({
        method: 'post',
        data: userData,
        url: `${import.meta.env.VITE_URL as string}/users/signin`,
      });
      login(response.data);
      navigate(redirectPath, { replace: true });
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);

      setSignInError(errorMessage);
    }
  };
  return (
    <div className="login template d-flex justify-content-center align-items-center vh-100 bg-white">
      <div className=" rounded p-5 bg-blue">
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
          Do not have an account ? <Link to="/signup"> Click Here</Link>
        </p>
      </div>
    </div>
  );
}
