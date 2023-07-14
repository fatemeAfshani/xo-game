import axios from 'axios';
import { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext.js';
import { API_ACTIONS, OpenGame, User } from '../types.js';
import { getErrorMessage } from '../utils.js';

type UserState = {
  error: string;
  loading: boolean;
  total: number;
};
const initialState: UserState = {
  error: '',
  loading: false,
  total: 0,
};

type Action = {
  type: API_ACTIONS;
  error?: string;
};

const userReducer = (state: UserState, action: Action) => {
  switch (action.type) {
    case API_ACTIONS.CALL_API: {
      return {
        ...state,
        error: '',
        loading: true,
      };
    }
    case API_ACTIONS.SUCCESS: {
      return {
        ...state,
        loading: false,
        error: '',
      };
    }
    case API_ACTIONS.ERROR: {
      return {
        ...state,
        loading: false,
        error: action.error || '',
      };
    }

    default: {
      return state;
    }
  }
};

export default function Home() {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const { loading, error } = state;
  const navigate = useNavigate();

  const { user: userAuth, logout } = useAuth();
  const [user, setUser] = useState<User>({
    _id: '',
    username: '',
    score: 0,
    winCount: 0,
    lossCount: 0,
    drawCount: 0,
  });

  const [openGames, setOpenGames] = useState<OpenGame[]>([]);

  useEffect(() => {
    dispatch({ type: API_ACTIONS.CALL_API });
    const getUser = async () => {
      try {
        const response = await axios({
          url: `${import.meta.env.VITE_URL as string}/users/me`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${userAuth?.token}`,
          },
        });

        console.log('##### resposne.data', response.data);
        setUser({ ...response.data });
        dispatch({
          type: API_ACTIONS.SUCCESS,
        });
      } catch (error: any) {
        if (error.response && error.response.status === 401) {
          logout();
        }
        const errorMessage = getErrorMessage(error);
        dispatch({ type: API_ACTIONS.ERROR, error: errorMessage });
      }
    };

    const getOpenGames = async () => {
      try {
        const response = await axios({
          url: `${import.meta.env.VITE_URL as string}/games/open`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${userAuth?.token}`,
          },
        });

        console.log('##### resposne.data', response.data);
        setOpenGames(response.data);
        dispatch({
          type: API_ACTIONS.SUCCESS,
        });
      } catch (error: any) {
        if (error.response && error.response.status === 401) {
          logout();
        }
        const errorMessage = getErrorMessage(error);
        dispatch({ type: API_ACTIONS.ERROR, error: errorMessage });
      }
    };
    getUser();
    getOpenGames();
  }, [userAuth?.token, logout]);

  const createAGame = async () => {
    dispatch({ type: API_ACTIONS.CALL_API });
    try {
      const response = await axios({
        url: `${import.meta.env.VITE_URL as string}/games`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userAuth?.token}`,
        },
      });

      console.log('##### resposne.data', response.data);
      navigate('waiting', { state: { gameId: response?.data._id } });
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        logout();
      }
      const errorMessage = getErrorMessage(error);
      dispatch({ type: API_ACTIONS.ERROR, error: errorMessage });
    }
  };

  const joinGame = async (gameId: string) => {
    dispatch({ type: API_ACTIONS.CALL_API });
    try {
      const response = await axios({
        url: `${import.meta.env.VITE_URL as string}/games/join/${gameId}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userAuth?.token}`,
        },
      });

      console.log('##### after joining game', response.data);
      if (response.data) {
        navigate('/playground', { state: { gameId } });
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        logout();
      }
      const errorMessage = getErrorMessage(error);
      dispatch({ type: API_ACTIONS.ERROR, error: errorMessage });
    }
  };
  return (
    <div className="container min-vh-100">
      {error && (
        <div className="alert alert-danger m-3" role="alert">
          {error}
        </div>
      )}
      {loading && (
        <div className="alert alert-info m-3" role="alert">
          {loading}
        </div>
      )}

      <div className="row text-center m-5 fs-3">
        <div className="col-sm-12 h5 mb-3">username: {user.username}</div>
        <div className="col-sm-6 col-md-3 h6">score: {user.score}</div>
        <div className="col-sm-6 col-md-3 h6">winCount: {user.winCount}</div>
        <div className="col-sm-6 col-md-3 h6">lossCount: {user.lossCount}</div>
        <div className="col-sm-6 col-md-3 h6">drawCount: {user.drawCount}</div>
      </div>

      <div className="row text-center">
        <div className="col-sm-12 col-md-6">
          <button className="btn btn-dark p-3 m-3 btn-large" onClick={() => createAGame()}>
            create a game
          </button>
        </div>
        <div className="col-sm-12 col-md-6">
          <button className="btn btn-dark p-3 m-3 btn-large">join via inviteCode</button>
        </div>
      </div>
      <div className="row text-center">
        <div className="col-sm-12 col-md-6">
          <h5 className="my-4">open games </h5>
          <table className="table  table-striped">
            <thead>
              <tr>
                <th scope="col">Username</th>
                <th scope="col">Score</th>
                <th scope="col">Join</th>
              </tr>
            </thead>
            <tbody>
              {openGames?.length > 0 &&
                openGames?.map((openGame) => {
                  return (
                    <tr key={openGame._id}>
                      <td>{openGame.username}</td>
                      <td>{openGame.score}</td>
                      <td>
                        <button className="btn btn-dark" onClick={() => joinGame(openGame._id)}>
                          join
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
