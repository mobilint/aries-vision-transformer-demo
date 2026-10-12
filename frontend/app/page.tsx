"use client";

import { Circle, RestartAlt } from "@mui/icons-material";
import { Box, Button, Grid2, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import Webcam from "react-webcam";

const theme = createTheme({
  typography: {
    fontFamily: "Pretendard",
  },
});

const TIME_INTERVAL = 1;

export default function Home() {
  const socket = useRef<Socket | null>(null);
  const webcamRef = useRef<Webcam | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isDescribing, setIsDescribing] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onDescribed(nextDescription: string) {
      let capitalized = nextDescription;

      if (capitalized.length > 0) {
        capitalized = capitalized[0].toUpperCase() + capitalized.slice(1);
      }

      setDescription(capitalized);
      setIsDescribing(false);
    }

    socket.current = io("ws://localhost:5000");
    socket.current.on("connect", onConnect);
    socket.current.on("disconnect", onDisconnect);
    socket.current.on("described", onDescribed);

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current.off("connect", onConnect);
        socket.current.off("disconnect", onDisconnect);
        socket.current.off("described", onDescribed);
      }
    };
  }, []);

  useEffect(() => {
    if (isConnected && isDescribing == false && imageSrc == null) {
      setTimeout(() => describe(), TIME_INTERVAL);
    }
  }, [isConnected, isDescribing, imageSrc]);

  function describe() {
    if (socket.current == null) {
      return;
    }

    if (webcamRef.current == null) {
      if (imageSrc == null) {
        setTimeout(() => describe(), 100);
      }
      return;
    }

    if (imageSrc == null) {
      const nextImageSrc = webcamRef.current.getScreenshot();

      if (nextImageSrc == null) {
        setTimeout(() => describe(), 100);
        return;
      }

      setIsDescribing(true);
      socket.current.emit("describe", nextImageSrc);
      return;
    }

    setIsDescribing(true);
    socket.current.emit("describe", imageSrc);
  }

  function capture() {
    if (socket.current == null || webcamRef.current == null) {
      return;
    }

    const nextImageSrc = webcamRef.current.getScreenshot();

    if (nextImageSrc == null) {
      return;
    }

    setImageSrc(nextImageSrc);
    setTimeout(() => describe(), TIME_INTERVAL);
  }

  function uncapture() {
    setImageSrc(null);
  }

  if (isConnected == false) {
    return (
      <ThemeProvider theme={theme}>
        <Grid2
          container
          justifyContent="center"
          alignItems="center"
          sx={{ width: "100vw", height: "100dvh" }}
        >
          <Typography sx={{ color: "#FFFFFF", fontSize: "24px", fontWeight: 500 }}>
            Connecting to ARIES vision service...
          </Typography>
        </Grid2>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Grid2
        container
        direction="column"
        wrap="nowrap"
        sx={{
          width: "100vw",
          height: "100dvh",
          padding: { xs: "24px 20px 20px", md: "40px 40px 24px" },
          overflow: "hidden",
        }}
      >
        <Grid2
          container
          alignItems="center"
          justifyContent="center"
          wrap="nowrap"
          columnSpacing={{ xs: "12px", md: "20px" }}
          sx={{
            flexShrink: 0,
            minWidth: 0,
            marginBottom: { xs: "20px", md: "24px" },
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0,
              padding: "8px 20px",
              backgroundColor: "#111111CC",
              borderRadius: "999px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <Circle sx={{ color: "#E70000", fontSize: "11px" }} />
            <Typography sx={{ color: "#FFFFFF", fontSize: "18px", fontWeight: 500 }}>
              Live
            </Typography>
          </Box>
            <Typography
              sx={{
                minWidth: 0,
                color: "#FFFFFF",
                fontSize: { xs: "30px", md: "48px" },
                lineHeight: 1.15,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Vision Transformer Powered by ARIES
          </Typography>
        </Grid2>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: { xs: "16px", md: "20px" },
          }}
        >
          <Typography
            sx={{
              flexShrink: 0,
              color: "#B6C3D8",
              fontSize: { xs: "16px", md: "18px" },
              lineHeight: 1.3,
            }}
          >
            {description == null
              ? "Please wait for AI's description..."
              : "Here is what AI thinks about your image."}
          </Typography>

          <Box
            sx={{
              flex: 1,
              width: "100%",
              minHeight: 0,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                maxWidth: "1120px",
                height: "100%",
                overflow: "hidden",
                borderRadius: "32px",
                border: "1px solid rgba(215, 223, 239, 0.14)",
                backgroundColor: "#101826",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.36)",
              }}
            >
              <Webcam
                ref={webcamRef}
                audio={false}
                disablePictureInPicture
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: imageSrc == null ? "block" : "none",
                }}
              />
              {imageSrc != null && (
                <Box
                  component="img"
                  src={imageSrc}
                  alt="Captured frame"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}
            </Box>
          </Box>

          <Box
            sx={{
              flexShrink: 0,
              width: "100%",
              maxWidth: "1120px",
              padding: { xs: "18px 20px", md: "20px 24px" },
              borderRadius: "20px",
              backgroundColor: "#242424",
              border: "1px solid #3A3A3A",
              boxShadow: "0 20px 48px rgba(0, 0, 0, 0.28)",
            }}
          >
            <Typography
              sx={{
                color: "#FFFFFF",
                fontSize: { xs: "18px", md: "24px" },
                lineHeight: 1.4,
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              {description == null
                ? "Waiting for ARIES to describe the current scene."
                : description}
            </Typography>
          </Box>

          <Box
            sx={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
            }}
          >
            {imageSrc == null ? (
              <Button
                variant="contained"
                disableElevation
                onClick={() => capture()}
                sx={{
                  minWidth: "140px",
                  padding: "15px 22px",
                  textTransform: "none",
                  borderRadius: "29px",
                  fontSize: "18px",
                  fontWeight: 500,
                  backgroundColor: "#0073FF",
                  color: "#FFFFFF",
                  boxShadow: "0 18px 40px rgba(0, 115, 255, 0.24)",
                  "&:hover": {
                    backgroundColor: "#0D6BDF",
                  },
                }}
              >
                Capture
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<RestartAlt />}
                onClick={() => uncapture()}
                sx={{
                  minWidth: "140px",
                  padding: "15px 22px",
                  textTransform: "none",
                  borderRadius: "999px",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#FFFFFF",
                  backgroundColor: "#242424",
                  border: "1px solid #4D4D4D",
                  boxShadow: "0 18px 40px rgba(0, 0, 0, 0.22)",
                  "&:hover": {
                    backgroundColor: "#2E2E2E",
                  },
                }}
              >
                Reset
              </Button>
            )}
          </Box>
        </Box>
      </Grid2>
    </ThemeProvider>
  );
}
