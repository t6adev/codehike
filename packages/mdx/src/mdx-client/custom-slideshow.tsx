import React, { useCallback } from "react"
import { clamp, useInterval } from "utils"
import { EditorStep } from "../mini-editor"
import { InnerCode, updateEditorStep } from "./code"
import { Preview, PresetConfig } from "./preview"
import { extractPreviewSteps } from "./steps"
import {
  CodeConfigProps,
  ElementProps,
  GlobalConfig,
} from "../core/types"

type SlideshowProps = {
  globalConfig: GlobalConfig
  // data
  children: React.ReactNode
  editorSteps: EditorStep[]
  hasPreviewSteps?: boolean
  presetConfig?: PresetConfig
  // local config
  autoFocus?: boolean
  start?: number
  onChange?: (e: { index: number }) => void
  autoPlay?: number
  loop?: boolean
  renderNode: (p: {
    onPrev: () => void
    onNext: () => void
    disabledPrev: boolean
    disabledNext: boolean
    maxSteps: number
    currentIndex: number
    setIndex: (arg0: number) => void
    hasNotes: boolean
    note: React.ReactNode
  }) => React.ReactNode
} & CodeConfigProps &
  ElementProps

export function CustomSlideshow(props: SlideshowProps) {
  return <InnerSlideshow {...props} />
}

function InnerSlideshow({
  globalConfig,
  // data
  children,
  editorSteps,
  hasPreviewSteps,
  presetConfig,
  // local config:
  autoFocus,
  autoPlay,
  // Set the initial slide index
  start = 0,
  // Called when the slideshow state changes and returns the current state object
  onChange: onSlideshowChange = () => {},
  loop = false,
  // element props:
  className,
  style,
  renderNode,
  // code config props:
  ...codeConfigProps
}: SlideshowProps) {
  const { stepsChildren, previewChildren } =
    extractPreviewSteps(children, hasPreviewSteps)
  const withPreview = presetConfig || hasPreviewSteps

  const hasNotes = stepsChildren.some(
    (child: any) => child.props?.children
  )

  const maxSteps = editorSteps.length - 1

  const [state, setState] = React.useState(() => {
    const startIndex = clamp(start, 0, maxSteps)
    return {
      stepIndex: startIndex,
      step: editorSteps[startIndex],
    }
  })

  const { stepIndex: currentIndex, step: tab } = state

  const atSlideshowEnd = currentIndex === maxSteps

  React.useEffect(() => {
    onSlideshowChange({ index: currentIndex })
  }, [currentIndex])

  function onTabClick(filename: string) {
    const newStep = updateEditorStep(tab, filename, null)
    setState({ ...state, step: newStep })
  }

  function setIndex(newIndex: number) {
    const stepIndex = clamp(newIndex, 0, maxSteps)
    setState({ stepIndex, step: editorSteps[stepIndex] })
  }

  function nextSlide() {
    setState(s => {
      const stepIndex = loop
        ? (s.stepIndex + 1) % (maxSteps + 1)
        : clamp(s.stepIndex + 1, 0, maxSteps)
      return {
        stepIndex,
        step: editorSteps[stepIndex],
      }
    })
  }

  const onPrev = useCallback(() => {
    setIndex(currentIndex - 1)
  }, [currentIndex])

  useInterval(nextSlide, autoPlay)

  return (
    <div
      className={`ch-custom-slideshow ${
        withPreview
          ? "ch-custom-slideshow-with-preview"
          : ""
      } ${className || ""}`}
      style={style}
      data-ch-theme={globalConfig.themeName}
    >
      <div className="ch-custom-slideshow-slide">
        <InnerCode
          globalConfig={globalConfig}
          editorStep={tab}
          codeConfigProps={codeConfigProps}
          onTabClick={onTabClick}
        />
        {presetConfig ? (
          <Preview
            className="ch-custom-slideshow-preview"
            files={tab.files}
            presetConfig={presetConfig}
            globalConfig={globalConfig}
          />
        ) : hasPreviewSteps ? (
          <Preview
            className="ch-custom-slideshow-preview"
            {...previewChildren[currentIndex]["props"]}
            globalConfig={globalConfig}
          />
        ) : null}
      </div>

      {renderNode({
        onPrev,
        onNext: nextSlide,
        disabledPrev: currentIndex === 0,
        disabledNext: atSlideshowEnd,
        maxSteps,
        currentIndex,
        setIndex,
        hasNotes,
        note: hasNotes ? stepsChildren[currentIndex] : null,
      })}
    </div>
  )
}

function useAutoFocusRef(autoFocus: boolean) {
  const ref = React.useRef(null)
  React.useEffect(() => {
    autoFocus && ref.current.focus()
  }, [])
  return ref
}
