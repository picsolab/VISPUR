import React, { useState, Fragment } from "react";
// import { GetEventData } from "react-compound-slider";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";

// Based on Material Design spec:
// Styles by https://github.com/RafeSacks
// https://material.io/design/components/sliders.html#spec
const trackHeight = 1;
const thumbHeight = 12;

// *******************************************************
// RAIL COMPONENT
// *******************************************************

const muiRailStyle = theme => ({
  rail: {
    backgroundColor: theme.palette.grey[400],
    width: "100%",
    height: trackHeight,
    position: "absolute",
    pointerEvents: "none"
  },
  railHotspot: {
    // backgroundColor: "green", // for debugging
    width: "100%",
    height: thumbHeight * 2, // Invisible hotspot same size as thumb
    top: thumbHeight * -1,
    position: "absolute",
    cursor: "pointer"
  }
});

function MuiRailComponent({ classes, getRailProps }) {
  return (
    <Fragment>
      <div className={classes.railHotspot} {...getRailProps()} />
      <div className={classes.rail} />
    </Fragment>
  );
}

MuiRailComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  getRailProps: PropTypes.func.isRequired
};

export const MuiRail = withStyles(muiRailStyle)(MuiRailComponent);

// // *******************************************************
// // TOOLTIP COMPONENT
// // *******************************************************

// const railStyle = {
//   position: 'absolute',
//   width: '100%',
//   transform: 'translate(0%, -50%)',
//   height: 40,
//   cursor: 'pointer',
//   zIndex: 300,
// };

// const railCenterStyle = {
//   position: 'absolute',
//   width: '100%',
//   transform: 'translate(0%, -50%)',
//   height: 14,
//   borderRadius: 7,
//   cursor: 'pointer',
//   pointerEvents: 'none',
//   backgroundColor: 'rgb(155,155,155)',
// };


// export const TooltipRail = ({ 
//   activeHandleID, 
//   getRailProps
// }) => {
//   const [ value, setValue ] = useState([]);
//   const [ percent, setPercent ] = useState([]);


//   const onMouseEnter = () => {
//     document.addEventListener('mousemove', onMouseMove);
//   };

//   const onMouseLeave = () => {
//     setValue(null);
//     setPercent(null);
//     document.removeEventListener('mousemove', onMouseMove);
//   };

//   const onMouseMove = (e) => {

//     if (activeHandleID) {
//       setValue(null);
//       setPercent(null);
//     } else {
//       // this.setState(GetEventData(e));
//     }
//   };

//   return (
//     <Fragment>
//       {!activeHandleID && value ? (
//         <div
//           style={{
//             left: `${percent}%`,
//             position: 'absolute',
//             marginLeft: '-11px',
//             marginTop: '-35px',
//           }}
//         >
//           <div className="tooltip">
//             <span className="tooltiptext">Value: {value}</span>
//           </div>
//         </div>
//       ) : null}
//       <div
//         style={railStyle}
//         {...getRailProps({
//           onMouseEnter: onMouseEnter,
//           onMouseLeave: onMouseLeave,
//         })}
//       />
//       <div style={railCenterStyle} />
//     </Fragment>
//   );
// }


// *******************************************************
// HANDLE COMPONENT
// *******************************************************

const muiHandleStyle = theme => ({
  root: {
    backgroundColor: theme.palette.secondary.main,
    marginLeft: thumbHeight * -0.5,
    marginTop: thumbHeight * -0.5,
    width: thumbHeight * 0.5,
    height: thumbHeight,
    border: 0,
    // borderRadius: "50%", // circle
    // boxShadow: "1px 1px 1px 1px rgba(0, 0, 0, 0.2)",
    whiteSpace: "nowrap", // for child display inline-block to work
    position: "absolute",
    zIndex: 2,
    cursor: "pointer"
  }
});

function MuiHandleComponent({
  domain: [min, max],
  handle: { id, value, percent },
  classes,
  getHandleProps
}) {
  return (
    <div
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      className={classes.root}
      style={{ left: `${percent}%` }}
      {...getHandleProps(id)}
    />
  );
}

MuiHandleComponent.propTypes = {
  domain: PropTypes.array.isRequired,
  handle: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired
  }).isRequired,
  classes: PropTypes.object.isRequired,
  getHandleProps: PropTypes.func.isRequired
};

export const MuiHandle = withStyles(muiHandleStyle)(MuiHandleComponent);

// *******************************************************
// TRACK COMPONENT
// *******************************************************

const muiTrackStyle = theme => ({
  track: {
    backgroundColor: theme.palette.secondary.main,
    height: trackHeight,
    position: "absolute",
    zIndex: 1,
    pointerEvents: "none"
  },
  trackHotspot: {
    // backgroundColor: "grey", // for debugging
    height: thumbHeight, // Invisible hotspot same size as thumb
    top: thumbHeight * -0.5,
    position: "absolute",
    cursor: "pointer"
  }
});

function MuiTrackComponent({ classes, source, target, getTrackProps }) {
  const left = `${source.percent}%`;
  const width = `${target.percent - source.percent}%`;

  return (
    <Fragment>
      <div className={classes.track} style={{ left, width }} />
      <div
        className={classes.trackHotspot}
        style={{ left, width }}
        {...getTrackProps()}
      />
    </Fragment>
  );
}

MuiTrackComponent.propTypes = {
  source: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired
  }).isRequired,
  target: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired
  }).isRequired,
  classes: PropTypes.object.isRequired,
  getTrackProps: PropTypes.func.isRequired
};

export const MuiTrack = withStyles(muiTrackStyle)(MuiTrackComponent);

// *******************************************************
// TICK COMPONENT
// *******************************************************

const muiTickStyle = theme => ({
  tick: {
    position: "absolute",
    marginTop: 2,
    width: 1,
    height: 4,
    backgroundColor: "black"
  },
  label: {
    position: "absolute",
    marginTop: 3,
    textAlign: "center"
  }
});

export function MuiTickComponent({ classes, tick, count, format }) {
  return (
    <div>
      <div className={classes.tick} style={{ left: `${tick.percent}%` }} />
      <Typography
        className={classes.label}
        variant="caption"
        style={{
          marginLeft: `${-(100 / count) / 2}%`,
          width: `${100 / count}%`,
          left: `${tick.percent}%`
        }}
      >
        {format(tick.value)}
      </Typography>
    </div>
  );
}

MuiTickComponent.propTypes = {
  tick: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired
  }).isRequired,
  classes: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
  format: PropTypes.func.isRequired
};

MuiTickComponent.defaultProps = {
  format: d => d
};

export const MuiTick = withStyles(muiTickStyle)(MuiTickComponent);
