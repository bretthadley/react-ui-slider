/**
 * Created by Brett Hadley on 11/04/2016.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import ReactUISlider from '../dist/ReactUISlider';

class Demo extends React.Component {

    handleSliderChange = (value) => {
        console.log("changed", value);
    }

    render() {

        const sliderProps = {
            min: 0,
            max: 100,
            step: 2,
            label: "Deposit",
            labelAfter: "GBP (£)",
            onAfterChange: this.handleSliderChange
        }

        return (
            <ReactUISlider { ...sliderProps } />
        )
    }
}

ReactDOM.render(<Demo />, document.getElementById('demo'));