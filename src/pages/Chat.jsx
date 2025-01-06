import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
axios.defaults.withCredentials = true;

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  // useEffect(async () => {
  //   if (!localStorage.getItem("chat-app-current-user")) {
  //     navigate("/login");
  //   } else {
  //     setCurrentUser(
  //       await JSON.parse(
  //         localStorage.getItem("chat-app-current-user")
  //       )
  //     );
  //   }
  // }, []);
  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = localStorage.getItem("chat-app-current-user");

      if (!storedUser) {
        navigate("/login");
      } else {
        try {
          const parsedUser = await JSON.parse(storedUser);
          setCurrentUser(parsedUser);
        } catch (error) {
          console.error("Failed to parse user data:", error);
          navigate("/login");
        }
      }
    };

    fetchUser();
  }, []);
  useEffect(() => {
    if (currentUser) {
      socket.current = io(host, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  useEffect(async () => {
    if (currentUser) {
      if (currentUser.isAvatarImageSet) {
        console.log("current user id",currentUser._id);
        try {
          const data = await axios.get(`${allUsersRoute}/${currentUser._id}`,{
            withCredentials:true,
          });
          console.log("dn d",data.data);
          setContacts(data.data);
        } catch (error) {
          console.error(error);
          navigate("/login");
          
        }
      } else {
        navigate("/setAvatar");
      }
    }
  }, [currentUser]);
  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };
  return (
    <>
      <Container>
        <div className="container">
          <Contacts contacts={contacts} changeChat={handleChatChange} />
          {currentChat === undefined ? (
            <Welcome />
          ) : (
            <ChatContainer currentChat={currentChat} socket={socket} />
          )}
        </div>
      </Container>
    </>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  // background-color: #131324;
  background: #0F2027;  /* fallback for old browsers */
background: -webkit-linear-gradient(to right, #2C5364, #203A43, #0F2027);  /* Chrome 10-25, Safari 5.1-6 */
background: linear-gradient(to right, #2C5364, #203A43, #0F2027); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
