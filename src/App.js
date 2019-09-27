import React, { useState } from "react";
import styled from "styled-components";
import SplitGradientBackground from "./SplitGradientBackground";

const OuterBox = styled.div`
  width: 100vw;
  height: 400px;
  min-height: 30vh;
  box-shadow: 0 0 50px #999;
  position: relative;

  display: flex;
  justify-content: space-around;
  align-items: center;
`;

const Letter = styled.h1`
  color: #eee;
  user-select: none;
  font-family: "Helvetica Neue", sans-serif;
  font-weight: 100;
  font-size: 80pt;
  pointer-events: none;
`;

function getSliceFromEvent(event, splits) {
  const width = event.target.getBoundingClientRect().width;
  const x = event.clientX;
  const perc = x / width;
  const found = splits.findIndex(split => perc <= split);
  // debugger;
  return found === -1 ? splits.length : found;

}

export default function App() {
  const numSlices = 3;
  const [slice, setSlice] = useState(0);
  const gradients = [["#79CBCA", "#E684AE"], [[45, 76], [1, 73]]];
  const [gradient, setGradient] = useState(gradients[0]);
  const [firstSplit, setFirstSplit] = useState(0.25);
  const [secondSplit, setSecondSplit] = useState(0.75);
  const splits = [firstSplit, secondSplit];

  const backgroundStyleOptions = {
    boundaryFuzziness: 2.6,
    desaturatedPercent: 25,
    gradient: gradient,
    transitionTime: 0.3
  };

  return (
    <>
      <OuterBox
        onClick={event => setSlice(getSliceFromEvent(event, splits))}
      >
        <SplitGradientBackground
          selectedSlice={slice}
          numSlices={numSlices}
          splits={splits}
          {...backgroundStyleOptions}
        />

        <Letter>A</Letter>
        <Letter>B</Letter>
        <Letter>C</Letter>
      </OuterBox>

      {gradients.map((gradient, index) => (
        <button key={gradient} onClick={() => setGradient(gradient)}>
          Gradient {index}
        </button>
      ))}

      <input
        type="range"
        min={0}
        max={0.7}
        style={{ display: "block", width: "70vw" }}
        step={0.001}
        value={firstSplit}
        onChange={e => setFirstSplit(parseFloat(e.target.value))}
        onInput={e => setFirstSplit(parseFloat(e.target.value))}
      />
      <input
        type="range"
        min={0.3}
        max={1}
        style={{ display: "block", width: "70vw", marginLeft: "30vw" }}
        step={0.001}
        value={secondSplit}
        onChange={e => setSecondSplit(parseFloat(e.target.value))}
        onInput={e => setSecondSplit(parseFloat(e.target.value))}
      />
    </>
  );
}
