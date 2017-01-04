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

        const sliderPropsEven = {
            min: 0,
            max: 100,
            step: 10,
            label: "Deposit",
            labelAfter: "GBP (£)",
            onAfterChange: this.handleSliderChange
        }

        const sliderPropsUneven = {
            min: 1,
            max: 25,
            step: [1,5,10,20,25],
            label: "Deposit",
            labelAfter: "GBP (£)",
            onAfterChange: this.handleSliderChange,
            defaultValue : 1
        }

        const sliderPropsUnevenButEven = {
            min: 1,
            max: 25,
            step: [1,5,10,20,25],
            evenStepSpacing: true,
            label: "Deposit",
            labelAfter: "GBP (£)",
            onAfterChange: this.handleSliderChange
        }

        return (
            <div>
                <ReactUISlider { ...sliderPropsEven } />
                <ReactUISlider { ...sliderPropsUneven } />
                <ReactUISlider { ...sliderPropsUnevenButEven } />
            </div>
        )
    }
}

ReactDOM.render(<Demo />, document.getElementById('demo'));