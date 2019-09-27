import styled from "styled-components";
import convert from "color-convert";
import React, { useRef, useEffect, useMemo } from "react";
import PropTypes from "prop-types";

/**
 * Linearly interpolate in a range with a fraction.
 */
function lerp(lower, upper, percent) {
  return lower + percent * (upper - lower);
}

/**
 * Define the default style for our fill-background element.
 * @type {string}
 */
const elementStyle = `
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: -2;
    top: 0;
    // mix-blend-mode: hue;
`;

/**
 * Calculate the background style of a linear gradient cut into "slices",
 * with fuzzy boundaries between each slice. Each slice is desaturated except
 * the currently selected slice.
 */
function calculateBackgroundStyle(
  gradient,
  selectedSlice,
  numSlices,
  saturatedPercent,
  desaturatedPercent,
  boundaryFuzziness,
  splits
) {
  const stops = [];
  const [gradientStart, gradientStop] = gradient;

  stops.push([
    gradientStart[0],
    selectedSlice === 0 ? saturatedPercent : desaturatedPercent,
    gradientStart[1],
    0
  ]);

  for (let i = 1; i < numSlices; i++) {
    let percentage = splits ? splits[i - 1] : i / numSlices;

    const lower = percentage - boundaryFuzziness / 2 / 100;
    const upper = percentage + boundaryFuzziness / 2 / 100;
    stops.push([
      lerp(gradientStart[0], gradientStop[0], lower),
      selectedSlice === i - 1 ? saturatedPercent : desaturatedPercent,
      lerp(gradientStart[1], gradientStop[1], lower),
      lower * 100
    ]);

    stops.push([
      lerp(gradientStart[0], gradientStop[0], upper),
      selectedSlice === i ? saturatedPercent : desaturatedPercent,
      lerp(gradientStart[1], gradientStop[1], upper),
      upper * 100
    ]);
  }

  stops.push([
    gradientStop[0],
    selectedSlice === numSlices - 1 ? saturatedPercent : desaturatedPercent,
    gradientStop[1],
    100
  ]);

  const gradientStyle = stops
    .map(([h, s, l, pc]) => `hsl(${h}, ${s}%, ${l}%) ${pc}%`)
    .join(", ");
  return `linear-gradient(to right, ${gradientStyle})`;
}

const Background = styled.div`
  ${elementStyle}
`;

const Clone = styled.div`
  ${elementStyle} opacity: 0;
`;

/**
 * Run an effect for every *update* to a value – not to
 * the initial setting of the value, though.
 */
function useUpdate(fn, inputs) {
  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) {
      fn();
    } else {
      loadedRef.current = true;
    }
  }, inputs);
}

/**
 * Create a split gradient background for this component's parent.
 * @param numSlices The number of slices for the gradient background.
 * @param selectedSlice The currently selected slice.
 * @param gradient A pair of [hue, lightness] pairs describing a gradient.
 * @param saturatedPercent The saturation for the selected part of the gradient.
 * @param desaturatedPercent The saturation for the deselected gradient.
 * @param boundaryFuzziness How blurry the boundaries should be.
 * @param transitionTime How quickly the gradient changes to reflect the selected slice.
 * @param splits Optional; an array of percentages where the split points should go. Defaults to an even split.
 * @returns React component which gives its parent a split gradient background.
 */
export default function SplitGradientBackground({
  numSlices,
  selectedSlice,
  gradient,
  saturatedPercent,
  desaturatedPercent,
  boundaryFuzziness,
  transitionTime,
  splits
}) {
  if (!Array.isArray(gradient[0])) {
    let g0 = convert.hex.hsl(gradient[0]);
    gradient[0] = [g0[0], g0[2]];
    let g1 = convert.hex.hsl(gradient[1]);
    gradient[1] = [g1[0], g1[2]];
  }

  // Set some initial refs.
  const showingOriginal = useRef(true);
  const background = useRef(null);
  const clone = useRef(null);

  // Calculate the background style for the given slice.
  const backgroundStyle = calculateBackgroundStyle(
    gradient,
    selectedSlice,
    numSlices,
    saturatedPercent,
    desaturatedPercent,
    boundaryFuzziness,
    splits
  );

  const splitsKey = splits.join(',');

  // Set the initial style of the component.
  useEffect(() => {
    background.current.style.background = backgroundStyle;
  }, [splitsKey]);

  // Imperatively update the DOM elements.
  useUpdate(() => {
    const nextToChange = showingOriginal.current ? clone : background;
    nextToChange.current.style.background = backgroundStyle;
    clone.current.style.opacity = showingOriginal.current ? 1 : 0;
    showingOriginal.current = !showingOriginal.current;
  }, [backgroundStyle, splits]);

  // Return the DOM element and its clone.
  return (
    <>
      <Background className="background" ref={background} />
      <Clone
        className="clone"
        style={{ transition: `ease opacity ${transitionTime}s` }}
        ref={clone}
      />
    </>
  );
}

SplitGradientBackground.propTypes = {
  // Required props:
  numSlices: PropTypes.number.isRequired,
  selectedSlice: PropTypes.number.isRequired,
  gradient: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    PropTypes.arrayOf(PropTypes.string)
  ]).isRequired,
  saturatedPercent: PropTypes.number.isRequired,
  desaturatedPercent: PropTypes.number.isRequired,
  boundaryFuzziness: PropTypes.number.isRequired,
  transitionTime: PropTypes.number.isRequired,

  // Optional props:
  splits: PropTypes.arrayOf(PropTypes.number)
};

SplitGradientBackground.defaultProps = {
  saturatedPercent: 95,
  desaturatedPercent: 35,
  boundaryFuzziness: 1.5,
  gradient: [[45, 76], [1, 73]],
  transitionTime: 1
};
