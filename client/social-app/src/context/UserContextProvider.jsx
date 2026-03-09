import { UserContext } from "./Context.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  completeUserRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
  verifyTokenRequest,
} from "../services/auth.js";
import {
  checkSessionUsername,
  editUser,
  getFollowers,
  getFollowing,
  setUser,
  setFollower,
  deleteFollow,
  clearFollows,
  getUsers,
  addInHistory,
  getHistoryReducer,
  removeOneInHistory,
  removeHistory,
  completeUserState,
} from "../redux/slices/registerSlice.js";
import { useState, useEffect } from "react";
import { signInUser, logoutUser } from "../redux/slices/loginSlice.js";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  deleteAccountRequest,
  deleteHistoryRequest,
  deleteOneInHistoryRequest,
  followUserRequest,
  getFollowersRequest,
  getFollowingRequest,
  getHistoryRequest,
  pushInHistoryRequest,
  searchUsersRequest,
  unfollowRequest,
  updateUserRequest,
} from "../services/users.js";

const UserContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [errors, setErrors] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const signUp = async (user) => {
    try {
      const res = await registerRequest(user);
      if (res) {
        const verifyRes = await verifyTokenRequest();
        //console.log(res)
        dispatch(setUser(verifyRes));
        dispatch(checkSessionUsername(verifyRes.username));
        setIsAuthenticated(true);
        setLoading(false);
        navigate("/home");
      } else {
        console.error("La respuesta es", res);
      }
    } catch (error) {
      //console.error(error.response.data)
      setErrors(error.response);
    }
  };

  const signIn = async (user) => {
    try {
      const res = await loginRequest(user);
      if (res) {
        const verifyRes = await verifyTokenRequest();
        //console.log(res)
        setIsAuthenticated(true);
        //dispatch(signInUser(res))
        dispatch(setUser(verifyRes));
        dispatch(checkSessionUsername(verifyRes.username));
        setLoading(false);
        navigate("/home");
      } else {
        console.error("La respuesta es:", res);
      }
    } catch (error) {
      //console.error(error.response.data)
      setErrors(error.response);
    }
  };

  const completeUser = async (id, data) => {
    try {
      const res = await completeUserRequest(id, data);
      if (res) {
        dispatch(
          completeUserState({
            username: data.username,
            birthDate: data.birthDate,
          }),
        );
        navigate("/home");
      } else {
        console.error("La respuesta es: ", res);
      }
    } catch (error) {
      console.error(error);
      setErrors(error.response.data);
    }
  };

  const userLogout = async (username) => {
    try {
      await logoutRequest(username);
      Cookies.remove("token");
      setIsAuthenticated(false);
      dispatch(logoutUser());
      setLoading(false);
      navigate("/");
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const updateUser = async (username, values) => {
    try {
      const res = await updateUserRequest(username, values);
      if (res) {
        dispatch(editUser(res.data));
        //console.log(res.data)
        setLoading(false);
      } else {
        console.error("La respuesta es: ", res);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const showFollowers = async (username) => {
    try {
      dispatch(clearFollows());

      const res = await getFollowersRequest(username);
      if (res) {
        dispatch(getFollowers(res.findFollowers));
        dispatch(getFollowing(res.usersFollowing));
        setLoading(false);
      } else {
        console.log("La respuesta es: ", res);
      }
    } catch (error) {
      if (error.response.status === 404) {
        console.log("El usuario no se encuentra");
      } else {
        console.error(error);
      }
    }
  };

  const showFollowing = async (username) => {
    try {
      const res = await getFollowingRequest(username);
      if (res) {
        dispatch(getFollowing(res));
        setLoading(false);
      } else {
        console.log("La respuesta es: ", res);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const followUser = async (user) => {
    try {
      const res = await followUserRequest(user);
      if (res) {
        dispatch(setFollower(res));
        setLoading(false);
      } else {
        console.log("La respuesta es: ", res);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const unfollow = async (userId) => {
    try {
      const res = await unfollowRequest(userId);
      if (res) {
        dispatch(deleteFollow(userId));
        setLoading(false);
      } else {
        console.log("La respuesta es: ", res);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const searchUsers = async (searchValue) => {
    try {
      const res = await searchUsersRequest(searchValue);
      if (res) {
        dispatch(getUsers(res.users));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const pushHistory = async (userId, searchedUserId, type) => {
    try {
      const res = await pushInHistoryRequest(userId, searchedUserId, type);
      if (res) {
        dispatch(addInHistory(res));
      } else {
        console.log("La respuesta es: ", res);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getHistory = async (type) => {
    try {
      const res = await getHistoryRequest(type);
      if (res) {
        dispatch(getHistoryReducer(res.searches));
      } else {
        console.log("La respuesta es: ", res);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const deleteOneInHistory = async (id, type) => {
    try {
      await deleteOneInHistoryRequest(id, type);
      dispatch(removeOneInHistory(id));
    } catch (error) {
      console.error(error);
    }
  };

  const deleteHistory = async (id, type) => {
    try {
      await deleteHistoryRequest(id, type);
      dispatch(removeHistory());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => {
        setErrors([]);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [errors]);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const res = await verifyTokenRequest();
      if (res) {
        dispatch(setUser(res));
        dispatch(checkSessionUsername(res.username));
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      await deleteAccountRequest();
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        signUp,
        signIn,
        completeUser,
        checkLogin,
        userLogout,
        updateUser,
        showFollowers,
        showFollowing,
        followUser,
        unfollow,
        searchUsers,
        pushHistory,
        getHistory,
        deleteOneInHistory,
        deleteHistory,
        deleteAccount,
        errors,
        isAuthenticated,
        loading,
        setLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
