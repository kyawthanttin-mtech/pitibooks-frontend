import React from "react";
import {Button} from "antd";
import { useNavigate } from "react-router-dom";

const ErrorPage = ({error, refetch}) => {
  const navigate = useNavigate();
  console.log(error.message);
  if (error.message.toLowerCase().includes("status code 401") 
      || error.message.toLowerCase().includes("unauthorized")
      || error.message.toLowerCase().includes("access denied")) 
  {
    navigate("/logout", { replace: true });
    return;
  }

  return (
    <div>
      <h1>An error has occurred while connecting to the server.</h1>
      <br />
      <p>{error.message}</p>
      <br />
      <Button type="default" onClick={() => refetch()} >Try Again</Button>
      <Button type="default" onClick={() => navigate("/logout", { replace: true })} >Logout</Button>
    </div>
  )
}

export default ErrorPage;