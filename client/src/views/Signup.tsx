import axios from 'axios';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext.js';
import { getErrorMessage } from '../utils.js';

type RegisterInput = {
  username: string;
  password: string;
};
export default function Signup() {
  const [userData, setUserData] = useState<RegisterInput>({
    username: '',
    password: '',
  });
  const [registerError, setRegisterError] = useState('');
  const [passwordError, setPasswordError] = useState('');

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
        url: `${import.meta.env.VITE_URL as string}/users/signup`,
      });
      login(response.data);
      navigate(redirectPath, { replace: true });
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);

      setRegisterError(errorMessage);
    }
  };
  return (
    <div className="signup template d-flex justify-content-center align-items-center vh-100 bg-white">
      <div className=" rounded p-5 bg-blue  ">
        <form onSubmit={clickHandler}>
          <h3 className="text-center">Sign Up</h3>
          {registerError && (
            <div className="alert alert-danger" role="alert">
              {registerError}
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
          {passwordError && <div className="text-danger">{passwordError}</div>}

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
            <div className="form-text">
              password must be at least 6 characters alphanumeric and contain a special character
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="password">Repeat Password</label>
            <input
              type="password"
              placeholder="repeat password"
              className="form-control"
              onChange={(e) => {
                if (e.target.value !== userData.password) {
                  setPasswordError('password and repeat password are not same');
                } else {
                  setPasswordError('');
                }
              }}
            />
          </div>
          <div className="d-grid my-4">
            <button className="btn btn-dark rounded">Sign Up</button>
          </div>
        </form>
        <p className="text-right">
          Already have an account ? <Link to="/signin"> Click Here</Link>
        </p>
      </div>
    </div>
  );
}
