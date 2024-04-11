import React, { useEffect, useRef, useState } from "react";
import { hightlightsSlides } from "../constants";
import gsap from "gsap";
import { pauseImg, playImg, replayImg } from "../utils";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const VideoCarousel = () => {
  const videoRef = useRef([]);
  const videoSpanRef = useRef([]);
  const videoDivRef = useRef([]);

  const [video, setVideo] = useState({
    isEnd: false,
    startPlay: false,
    videoId: 0,
    isLastVideo: false,
    isPlaying: false,
  });
  const { isEnd, startPlay, videoId, isLastVideo, isPlaying } = video;

  const [loadedData, setLoadedData] = useState([]);

  useGSAP(() => {
    gsap.to("#video", {
      scrollTrigger: {
        trigger: "#video",
        toggleActions: "restart none none none",
      },
      onComplete: () => {
        setVideo((prev) => ({ ...prev, startPlay: true, isPlaying: true }));
      },
    });
    gsap.to("#slider", {
      transform: `translateX(${-100 * videoId}%)`,
      duration: 2,
      ease: "power2.inOut",
    });
  }, [isEnd, videoId]);

  useEffect(() => {
    if (loadedData.length > 3) {
      if (!isPlaying) {
        videoRef.current[videoId].pause();
      } else {
        startPlay && videoRef.current[videoId].play();
      }
    }
  }, [startPlay, videoId, isPlaying, loadedData]);

  const handleLoadedMetaData = (index, event) =>
    setLoadedData((prev) => [...prev, event]);

  useEffect(() => {
    let currentProgress = 0;
    let span = videoSpanRef.current;

    if (span[videoId]) {
      //animate the progress of the video
      let animation = gsap.to(span[videoId], {
        onUpdate: () => {
          const progress = Math.ceil(animation.progress() * 100);
          if (progress !== currentProgress) {
            currentProgress = progress;
            gsap.to(videoDivRef.current[videoId], {
              width:
                window.innerWidth < 760
                  ? "10vw"
                  : window.innerWidth < 1200
                  ? "10vw"
                  : "4vw",
            });
            gsap.to(span[videoId], {
              width: `${currentProgress}%`,
              backgroundColor: "white",
            });
          }
        },
        onComplete: () => {
          if (isPlaying) {
            gsap.to(videoDivRef.current[videoId], {
              width: "12px",
            });
            gsap.to(span[videoId], {
              backgroundColor: "#afafaf",
            });
          }
        },
      });
      if (videoId === 0) {
        animation.restart();
      }
      const animationUpdate = () => {
        return animation.progress(
          videoRef.current[videoId].currentTime /
            hightlightsSlides[videoId].videoDuration
        );
      };
      if (isPlaying) {
        gsap.ticker.add(animationUpdate);
      } else {
        gsap.ticker.remove(animationUpdate);
      }
    }
  }, [videoId, startPlay]);

  const handleProcess = (type, index) => {
    switch (type) {
      case "video-end":
        setVideo((prevVideo) => ({
          ...prevVideo,
          isEnd: true,
          videoId: index + 1,
        }));
        break;
      case "video-last":
        setVideo((prevVideo) => ({
          ...prevVideo,
          isLastVideo: true,
        }));
        break;
      case "video-reset":
        setVideo((prevVideo) => ({
          ...prevVideo,
          isLastVideo: false,
          videoId: 0,
        }));
        break;
      case "play":
        setVideo((prevVideo) => ({
          ...prevVideo,
          isPlaying: !prevVideo.isPlaying,
        }));
        break;
      case "pause":
        setVideo((prevVideo) => ({
          ...prevVideo,
          isPlaying: !prevVideo.isPlaying,
        }));
        break;
      default:
        return video;
    }
  };

  return (
    <>
      <div className="flex items-center">
        {hightlightsSlides.map((highlight, index) => {
          return (
            <div key={highlight.id} id="slider" className="sm:pr-20 pr-10">
              <div className="video-carousel_container">
                <div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black">
                  <video
                    id="video"
                    playsInline
                    preload="auto"
                    className={`${
                      highlight.id === 2 && "translate-x-44"
                    } pointer-events-none`}
                    muted
                    ref={(el) => (videoRef.current[index] = el)}
                    onPlay={() => {
                      setVideo((prevVideo) => ({
                        ...prevVideo,
                        isPlaying: true,
                      }));
                    }}
                    onEnded={() =>
                      index !== 3
                        ? handleProcess("video-end", index)
                        : handleProcess("video-last")
                    }
                    onLoadedMetadata={(event) =>
                      handleLoadedMetaData(index, event)
                    }
                  >
                    <source src={highlight.video} type="video/mp4"></source>
                  </video>
                </div>
                <div className="absolute top-12 left-[5%] z-10">
                  {highlight.textLists.map((text) => (
                    <p key={text} className="md:text-2xl text-xl font-medium">
                      {text}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="relative flex-center mt-10 ">
        <div className="flex-center px-7 py-5 bg-gray-300 rounded-full backdrop-blur">
          {videoRef.current.map((_, index) => {
            return (
              <span
                key={index}
                ref={(el) => (videoDivRef.current[index] = el)}
                className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
              >
                <span
                  className="absolute h-full w-full rounded-full"
                  ref={(el) => (videoSpanRef.current[index] = el)}
                ></span>
              </span>
            );
          })}
        </div>
        <button className="control-btn">
          <img
            src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg}
            alt={isLastVideo ? "replay" : !isPlaying ? "play" : "pause"}
            onClick={
              isLastVideo
                ? () => handleProcess("video-reset")
                : !isPlaying
                ? () => handleProcess("play")
                : () => handleProcess("pause")
            }
          />
        </button>
      </div>
    </>
  );
};

export default VideoCarousel;
