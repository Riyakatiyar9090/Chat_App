// import { useState,useEffect } from "react";
// import { createContext } from "react";
// import toast from "react-hot-toast";
// import {io} from "socket.io-client";
// import axios from "axios";

// const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
// axios.defaults.baseURL + backendUrl;

// export const AuthContext = createContext();

// export const AuthProvider = ({ children })=>{

//     const [token,setToken] = useState(localStorage.getItem("token"))
//     const [authUser, setAuthUser] = useState(null);
//     const [onlineUsers, setOnlineUsers] = useState([]);
//     const [socket, setSocket] = useState(null);

// // check if user is authenticated and if so ,set the user data and connect the socket

//    const checkAuth = async ()=> {
//     try {
//         const { data } = await axios.get("/api/auth/check");
//         if(data.success){
//             setAuthUser(data.user)
//             connectSocket(data.user)
//         }
//     } catch (error) {
//         toast.error(error.message)
//     }
//    }

// //    login function to handle user authentication and socket connection

// const login = async (state,credentials)=>{
//     try{
//         const {data}= await axios.post(`/api/auth/${state}`,credentials);
//         if(data.success){
//             setAuthUser(data.userData);
//             connectSocket(data.userData);
//             axios.defaults.headers.common["token"]= data.token;
//             setToken(data.token);
//             localStorage.setItem("token",data.token)
//             toast.success(data.message)
//         } else {
//             toast.error(data.message)
//         }
//     } catch  (error){
//         toast.error(error.message)
//     }
// }

// // logout function to handle user logout and socket disconnection
// const logout = async ()=>{
//     localStorage.removeItem("token");
//     setToken(null);
//     setAuthUser(null);
//     setOnlineUsers([]);
//     axios.defaults.headers.common["token"]=null;
//     toast.success("Logged out successfully")
//     socket.disconnect();
// }

// // Update profile function to handle user profile updates
// const updateProfile = async (body) =>{
//     try{
//         const { data } = await axios.put("/api/auth/update-profile", body);
//         if(data.success){
//             setAuthUser(data.user);
//             toast.success("Profile updated successfully")
//         }
//     } catch (error){
//         toast.error(error.message)
//     }
// }

// //     connect socket functionn to handle socket connection and online users updates

// const connectSocket = (userData)=>{
//     if(!userData || socket?.connected) return;
//     const newSocket = io(backendUrl,{
//         query:{
//             userId: userData._id,
//         },
//          reconnection: true,
//          reconnectionDelay: 1000,
//          reconnectionDelayMax: 5000,
//          reconnectionAttempts: 5,
//     });
//     // newSocket.connect();
//     setSocket(newSocket);

//     newSocket.on("getOnlineUsers",(userIds)=>{
//         setOnlineUsers(userIds);
//     });
//     newSocket.on("connect_error", (error) => {
//     console.error("Socket connection error:", error);
//     toast.error("Connection failed");
//   });
// };

// useEffect(()=>{
//     if(token){
//         axios.defaults.headers.common["token"] = token;
//     }
//     checkAuth()
//    },[])

//     const value = {
//         axios,
//         authUser,
//         onlineUsers,
//         socket,
//         login,
//         logout,
//         updateProfile
//     }
//     return (
//         <AuthContext.Provider value={value}>
//             {children}
//         </AuthContext.Provider>
//     )
// }

import { useState, useEffect, createContext } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// ✅ FIX 1: Correct axios baseURL
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Attach token globally
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
    } else {
      delete axios.defaults.headers.common["token"];
    }
  }, [token]);

  // ✅ Check authentication
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      localStorage.removeItem("token");
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Login
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);

      if (data.success) {
        setAuthUser(data.userData);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        connectSocket(data.userData);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);

    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    toast.success("Logged out successfully");
  };

  // ✅ Update profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Connect socket
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket error:", error.message);
    });
  };

  // ✅ Run auth check ONCE
  useEffect(() => {
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
