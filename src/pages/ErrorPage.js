import React from "react";
import {Button} from "antd";

const ErrorPage = ({error, refetch}) => {
  return (
    <div>
      <h1>An error has occurred while connecting to the server.</h1>
      <br />
      <p>{error.message}</p>
      <br />
      <Button type="default" onClick={() => refetch()} >Try Again</Button>
    </div>
  )
}

export default ErrorPage;