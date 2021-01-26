import React from "react"
import { MiniBrowser } from "@code-hike/mini-browser"
import "@code-hike/mini-browser/dist/index.css"
import { WithProgress, Page } from "./utils"

export default {
  title: "Mini Browser Hike",
}

export const basic = () => (
  <Page>
    <MiniBrowser
      style={{ height: 300 }}
      steps={[
        {
          children: (
            <div
              style={{
                background: "beige",
                height: "100%",
              }}
            >
              Lorem Ipsum
            </div>
          ),
        },
      ]}
    ></MiniBrowser>
  </Page>
)

export const iframe = () => (
  <Page>
    <MiniBrowser
      steps={[{ url: "https://whatismyviewport.com/" }]}
      style={{ height: 300 }}
    />
  </Page>
)

export const zoom = () => (
  <Page>
    <MiniBrowser
      style={{ height: 300 }}
      steps={[
        { url: "https://whatismyviewport.com/", zoom: 0.5 },
      ]}
    />
  </Page>
)

export const defaultUrl = () => (
  <Page>
    <MiniBrowser
      steps={[
        {
          url: "/default",
          prependOrigin: true,
          zoom: 0.5,
          loadUrl: "https://whatismyviewport.com/",
        },
      ]}
      style={{ height: 300 }}
    />
  </Page>
)

export const steps = () => {
  const steps = [
    { zoom: 0.5, url: "https://whatismyviewport.com/" },
    { zoom: 1, url: "https://whatismyviewport.com/" },
    { zoom: 0.2, url: "https://whatismyviewport.com/" },
  ]
  return (
    <WithProgress length={steps.length}>
      {(progress, backward) => (
        <MiniBrowser
          style={{ height: 300 }}
          steps={steps}
          progress={progress}
          backward={backward}
        />
      )}
    </WithProgress>
  )
}

export const video = () => {
  const children = (
    <video
      autoPlay
      loop
      muted
      playsInline
      type="video/mp4"
      src="https://pomb.us/static/demo-75c5b2395f634c494e40b8008eef20eb.mp4"
    />
  )
  return (
    <Page>
      <MiniBrowser
        steps={[
          {
            url: "https://nextjs-static-props.now.sh/",
            children,
          },
        ]}
        style={{ height: 300 }}
      ></MiniBrowser>
    </Page>
  )
}
