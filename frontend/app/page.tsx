"use client";

import { Button, Grid2, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import Webcam from "react-webcam";
import { Circle, RestartAlt } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "Pretendard",
  },
});

// in milliseconds
const TIME_INTERVAL = 1;

export default function Home() {
  const socket = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isDescribing, setIsDescribing] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const webcamRef = useRef<Webcam | null>(null);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onDescribed(description: string) {
      let capitalized = description;
      if (capitalized.length > 0)
        capitalized = capitalized[0].toUpperCase() + capitalized.slice(1)
      setDescription(capitalized);
      setIsDescribing(false);
    }

    socket.current = io("ws://localhost:5000");
    socket.current.on('connect', onConnect);
    socket.current.on('disconnect', onDisconnect);
    socket.current.on('described', onDescribed);

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current.off('connect', onConnect);
        socket.current.off('disconnect', onDisconnect);
        socket.current.off('described', onDescribed);
      }
    };
  }, []);

  useEffect(() => {
    if (isDescribing == false && imageSrc == null)
      setTimeout(() => describe(), TIME_INTERVAL);
  }, [isDescribing, socket.current, webcamRef.current, imageSrc]);

  function describe() {
    if (socket.current && webcamRef.current) {
      if (imageSrc == null) {
        // alert("Capture failed!");
        let newImageSrc = webcamRef.current.getScreenshot();
        if (newImageSrc == null) {
          setTimeout(() => describe(), 100);
          return;
        }
        
        setIsDescribing(true);
        socket.current.emit("describe", newImageSrc);
      } else {
        
        setIsDescribing(true);
        socket.current.emit("describe", imageSrc);
      }
    }
  }

  function capture() {
    if (socket.current && webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc == null) {
        return;
      }

      setImageSrc(imageSrc);
      setTimeout(() => describe(), TIME_INTERVAL);
    }
  }

  function uncapture() {
    setImageSrc(null);
  }

  if (isConnected == false)
    return undefined;

  return (
    <ThemeProvider theme={theme}>
      <Grid2
        container
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        minWidth="100vw"
      >
        <Grid2
          container
          direction="column"
          wrap="nowrap"
          width="878px"
          justifyContent="center"
          alignItems="center"
          sx={{
            backgroundColor: "#121212",
            borderRadius: "40px",
            padding: "80px 0px"
          }}
        >
          <Grid2
            container
            direction="row"
            wrap="nowrap"
            justifyContent="center"
            alignItems="center"
            sx={{ marginBottom: "17px" }}
          >
            <Grid2
              container
              direction="row"
              wrap="nowrap"
              justifyContent="center"
              alignItems="center"
              sx={{
                padding: "7px 15px",
                backgroundColor: "#FF613B",
                borderRadius: "45px",
                marginRight: "20px",
              }}
            >
              <Circle sx={{ color: "white", marginRight: "8px", fontSize: "10px" }} />
              <Typography variant="h6" sx={{ color: "white", fontSize: "18px" }}>
                Live
              </Typography>
            </Grid2>
            <Typography variant="h4" sx={{ color: "white", fontSize: "36px", fontWeight: "bold" }}>
              Vision Transformer Demo
            </Typography>
          </Grid2>
          <Typography variant="body1" sx={{ color: "#BCBCBC", fontSize: "18px" }}>
            {
              description == null ?
                "Please wait for AI's description..." :
                "Here’s what AI thinks about your image."
            }
          </Typography>
          <Grid2
            container
            sx={{
              width: "640px",
              height: "480px",
              margin: "50px 0px",
              borderRadius: "30px",
              overflow: "hidden",
            }}
          >
            {imageSrc != null &&
              <img src={imageSrc} />
            }
            <Webcam
              ref={webcamRef}
              audio={false}
              disablePictureInPicture
              style={{
                display: imageSrc != null ? "hidden" : undefined
              }}
            />
          </Grid2>
          {description != null &&
            <Grid2
              container
              justifyContent="center"
              sx={{
                backgroundColor: "#0054EF",
                borderRadius: "10px",
                padding: "15px 18px",
                marginBottom: "20px",
                width: "640px",
              }}
            >
              <Typography variant="body1" sx={{ color: "white", fontSize: "18px" }} >
                {description}
              </Typography>
            </Grid2>
          }{imageSrc == null ?
            <Button
              variant="contained"
              disableElevation
              onClick={(e) => capture()}
              sx={{
                padding: "15px 20px",
                textTransform: "none",
                borderRadius: "10px",
              }}
            >
              Capture
            </Button> :
            <Button 
              variant="contained"
              startIcon={<RestartAlt />}
              sx={{
                color: "white",
                backgroundColor: "#FFFFFF19",
                padding: "7px 20px",
                textTransform: "none",
                fontSize: "16px",
                borderRadius: "45px",
                fontWeight: 300,
              }}
              onClick={(e) => uncapture()}
            >
              Reset
            </Button>
          }
        </Grid2>
      </Grid2>
    </ThemeProvider>
  );
}
