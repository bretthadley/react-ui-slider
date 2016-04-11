/**
 * Created by brett.hadley on 29/07/2015.
 */
import React from 'react';
import cx from 'classnames';

export default
class ReactSlider extends React.Component {

    static propTypes = {
        min: React.PropTypes.number,
        max: React.PropTypes.number,
        step: React.PropTypes.oneOfType([
            React.PropTypes.number,
            React.PropTypes.arrayOf(React.PropTypes.number)
        ]).isRequired,
        defaultValue: React.PropTypes.number,
        value: React.PropTypes.number,
        valuePrefix: React.PropTypes.string,
        valueSuffix: React.PropTypes.string,
        orientation: React.PropTypes.oneOf(['horizontal', 'vertical']),
        editable: React.PropTypes.bool,
        className: React.PropTypes.string,
        containerClassName: React.PropTypes.string,
        inputClassName: React.PropTypes.string,
        outputClassName: React.PropTypes.string,
        handleClassName: React.PropTypes.string,
        handleActiveClassName: React.PropTypes.string,
        barClassName: React.PropTypes.string,
        disabled: React.PropTypes.bool,
        snapDragDisabled: React.PropTypes.bool,
        onBeforeChange: React.PropTypes.func,
        onChange: React.PropTypes.func,
        onAfterChange: React.PropTypes.func,
        onSliderClick: React.PropTypes.func,
        onInputChange: React.PropTypes.func,
        onSliderRelease: React.PropTypes.func
    };

    static defaultProps = {
        min: 0,
        max: 100,
        defaultValue: 0,
        orientation: 'horizontal',
        containerClassName: 'slider__container',
        className: 'slider',
        handleClassName: 'slider__handle',
        handleActiveClassName: 'slider__handle--active',
        inputClassName: 'slider__input',
        outputClassName: 'slider__output',
        barClassName: 'slider__bar',
        labelClassName: 'slider__label',
        valuePrefix: null,
        valueSuffix: null,
        disabled: false,
        snapDragDisabled: false,
        invert: false,
        editable: false
    };

    state = {
        index: -1,
        upperBound: 0,
        sliderLength: 0,
        sliderStart: 0
    };

    shouldComponentUpdate(...args) {
        return React.addons.PureRenderMixin.shouldComponentUpdate.apply(this, args);
    }

    componentWillReceiveProps(nextProps) {
        const value = nextProps.value ? this._trimValue(nextProps.value, nextProps) : this._trimValue(nextProps.defaultValue, nextProps);

        if (this.state.value != value) { // eslint-disable-line
            this.setState({
                value,
                enteredValue: value
            });
        }
    }

    componentWillMount() {
        // props as initial state is anti pattern so moving to willMount hook.
        // also fixes bugwith IE9/10 where this.props in undefined when used with state = { ... }
        this.setState({
            value: this.props.value ? this.props.value : this.props.defaultValue,
            enteredValue: this.props.value ? this.props.value : this.props.defaultValue
        });
    }

    componentDidMount() {
        window.addEventListener('resize', this._handleResize);
        this._handleResize();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this._handleResize);
    }

    getValue() {
        return this.state.value;
    }

    _handleResize = () => {
        const slider = this.refs.slider;
        const handle = this.refs.handle;

        if (slider) {
            const rect = slider.getBoundingClientRect();
            const size = this._sizeKey();

            const sliderMax = rect[this._stylePositionMaxOffset()];
            const sliderMin = rect[this._stylePositionMinOffset()];

            this.setState({
                upperBound: slider[size] - handle[size],
                sliderLength: Math.abs(sliderMax - sliderMin),
                handleSize: handle[size],
                sliderStart: sliderMin
            });
        } else {
            this.forceUpdate();
        }
    };

    _calcOffset(val) {
        const value = val || this.state.value;
        const ratio = (value - this.props.min) / (this.props.max - this.props.min);
        return ratio * 100;
    }

    _calcValue(offset) {
        const ratio = offset / this.state.upperBound;
        return ratio * (this.props.max - this.props.min) + this.props.min;
    }

    _calcOffsetFromPosition = (position) => {
        let pixelOffset = position - this.state.sliderStart;
        pixelOffset -= (this.state.handleSize / 2);

        return pixelOffset;
    }

    _forceValueFromPosition = (position) => {
        const pixelOffset = this._calcOffsetFromPosition(position);
        const nextValue = this._trimAlignValue(this._calcValue(pixelOffset));

        this.setState({
            value: nextValue,
            enteredValue: nextValue
        });
    }

    _getMousePosition = (e) => ([
        e['page' + this._axisKey()],
        e['page' + this._orthogonalAxisKey()]
    ])

    _getTouchPosition = (e) => {
        const touch = e.touches[0];
        return [
            touch['page' + this._axisKey()],
            touch['page' + this._orthogonalAxisKey()]
        ];
    }

    _getMouseEventMap = () => ({
        mousemove: this._onMouseMove,
        mouseup: this._onMouseUp
    })

    _getTouchEventMap = () => ({
        touchmove: this._onTouchMove,
        touchend: this._onTouchEnd
    })

    _createMouseEvent = (e) => {
        if (this.props.disabled) return;
        const position = this._getMousePosition(e);
        this._start(position[0]);
        this._addHandlers(this._getMouseEventMap());
        e.preventDefault();
    }

    _createOnTouchStart = (e) => {
        if (this.props.disabled || e.touches.length > 1) return;
        const position = this._getTouchPosition(e);

        this.isScrolling = undefined; // don't know yet if the user is trying to scroll
        this._start(position[0]);
        this._addHandlers(this._getTouchEventMap());
        e.stopPropagation();
    }

    _addHandlers = (eventMap) => {
        for (const key in eventMap) {
            if (eventMap.hasOwnProperty(key)) {
                document.addEventListener(key, eventMap[key], false);
            }
        }
    }

    _removeHandlers(eventMap) {
        for (const key in eventMap) {
            if (eventMap.hasOwnProperty(key)) {
                document.removeEventListener(key, eventMap[key], false);
            }
        }
    }

    _start = (position) => {
        // if activeElement is body window will lost focus in IE9
        if (document.activeElement && document.activeElement != document.body) { // eslint-disable-line
            document.activeElement.blur();
        }

        this.hasMoved = false;

        this._fireChangeEvent('onBeforeChange');

        this.setState({
            startValue: this.state.value,
            startPosition: position
        });
    };

    _onMouseUp = () => {
        this._onEnd(this._getMouseEventMap());
        this._fireChangeEvent('onSliderRelease');
    };

    _onTouchEnd = () => {
        this._onEnd(this._getTouchEventMap());
        this._fireChangeEvent('onSliderRelease');
    };

    _onEnd = (eventMap) => {
        this._removeHandlers(eventMap);
        this._fireChangeEvent('onAfterChange');
    };

    _onMouseMove = (e) => {
        const position = this._getMousePosition(e);
        this._move(position[0]);
    };

    _onTouchMove = (e) => {
        if (e.touches.length > 1) return;

        const position = this._getTouchPosition(e);

        if (typeof this.isScrolling === 'undefined') {
            const diffMainDir = position[0] - this.state.startPosition[0];
            const diffScrollDir = position[1] - this.state.startPosition[1];
            this.isScrolling = Math.abs(diffScrollDir) > Math.abs(diffMainDir);
        }

        if (this.isScrolling) {
            this.setState({ index: -1 });
            return;
        }

        e.preventDefault();

        this._move(position[0]);
    };

    _move(position) {
        this.hasMoved = true;

        const diffPosition = position - this.state.startPosition;

        const diffValue = diffPosition / (this.state.sliderLength - this.state.handleSize) * (this.props.max - this.props.min);
        const newValue = this._trimAlignValue(this.state.startValue + diffValue);

        if (newValue !== this.state.value) {
            this.setState({
                value: newValue,
                enteredValue: newValue
            }, this._fireChangeEvent('onChange'));
        }
    }

    _axisKey() {
        if (this.props.orientation === 'vertical') {
            return 'Y';
        }

        return 'X';
    }

    _orthogonalAxisKey() {
        if (this.props.orientation === 'vertical') {
            return 'X';
        }

        return 'Y';
    }

    _stylePositionMinOffset() {
        if (this.props.orientation === 'vertical') {
            return 'top';
        }

        return 'left';
    }

    _stylePositionMaxOffset() {
        if (this.props.orientation === 'vertical') {
            return 'bottom';
        }

        return 'right';
    }

    _sizeKey() {
        if (this.props.orientation === 'vertical') return 'clientHeight';

        return 'clientWidth';
    }

    _trimAlignValue(val) {
        return this._alignValue(this._trimValue(val));
    }

    _trimValue(val, props = this.props) {
        let newVal = val;

        if (newVal < props.min) newVal = props.min;
        if (newVal > props.max) newVal = props.max;

        return newVal;
    }

    _alignValue(val) {
        if (Array.isArray(this.props.step)) {
            const percentOfSlider = Math.abs(this._calcOffset(val));
            const length = this.props.step.length;
            const correction = length / 100;
            const closestIndex = (length / (100 + correction)) * percentOfSlider;
            let alignValue = Math.round(closestIndex);

            if (alignValue >= length) {
                alignValue = length - 1;
            }

            if (alignValue < 0) {
                alignValue = 0;
            }

            return this.props.step[alignValue];
        }
        const valModStep = (val - this.props.min) % this.props.step;
        let alignValue = val - valModStep;

        if (Math.abs(valModStep) * 2 >= this.props.step) {
            alignValue += (valModStep > 0) ? this.props.step : (-this.props.step);
        }

        if (alignValue + this.props.step > this.props.max) {
            alignValue = this.props.max;
        }

        return parseFloat(alignValue.toFixed(5));
    }

    _onSliderClick = (e) => {
        e.preventDefault();
        this._fireChangeEvent('onSliderClick');
    };

    _onSliderMouseDown = (e) => {
        if (this.props.disabled) return;

        this.hasMoved = false;

        if (!this.props.snapDragDisabled) {
            const position = this._getMousePosition(e);

            this._forceValueFromPosition(position[0]);

            this._start(position[0]);
            this._addHandlers(this._getMouseEventMap());
        }

        e.preventDefault();
    };

    _fireChangeEvent(event) {
        if (this.props[event]) {
            this.props[event](this.state.value);
        }
    }

    _onInputChange = (e) => {
        const value = e.target.value;
        this.setState({
            enteredValue: value
        });
    };

    _onInputBlur = (e) => {
        let newValue;
        if (!e.target.value) {
            newValue = this.state.value;
        } else {
            newValue = this.state.enteredValue;
        }

        newValue = this._trimValue(parseInt(newValue, 10));

        const input = this.refs.input.getDOMNode();

        input.value = newValue;

        this.setState({
            value: newValue,
            enteredValue: newValue
        });

        if (this.props.onInputChange) {
            this.props.onInputChange(newValue);
        }
    };

    _onInputFocus = () => {
        const input = this.refs.input.getDOMNode();

        input.value = '';
    };

    _onKeyUp = (e) => {
        const enterKey = 13;
        if (e.which === enterKey) {
            this._onInputBlur(e);
        }
    };

    _buildHandleStyle(offset) {
        const style = {
            position: 'absolute',
            zIndex: 10
        };

        style[this._stylePositionMinOffset()] = offset + '%';
        return style;
    }

    _buildBarStyle(left, right) {
        const style = {
            position: 'absolute'
        };

        const _left = isNaN(left) ? 0 : left;
        const _right = isNaN(right) ? 0 : right;

        style[this._stylePositionMinOffset()] = _left + '%';
        style[this._stylePositionMaxOffset()] = (100 - _right) + '%';

        return style;
    }

    _renderHandle() {
        const offset = this._calcOffset();
        const classes = {};
        classes[this.props.handleClassName] = true;
        let handleClass = cx(classes);
        let style = this._buildHandleStyle(offset);

        return (
            <div
                key="handle"
                ref="handle"
                className={handleClass}
                style={style}
                onMouseUp={this._createMouseEvent}
                onTouchStart={this._createOnTouchStart}
                role="slider"
                aria-valuemin={this.props.min}
                aria-valuemax={this.props.max}
                aria-valuenow={this.props.value}
                aria-labelledby={this.props.labelClassName}
            ></div>
        );
    }

    _renderBar = (i, left, right) => {
        const classes = {};
        classes[this.props.barClassName] = true;
        classes[this.props.barClassName + '-' + i] = true;
        let barclass = cx(classes);
        let style = this._buildBarStyle(left, right);

        return (
            <div
                key={'bar' + i}
                ref={'bar' + i}
                className={barclass}
                style={style}
            ></div>
        );
    };

    _renderBars = () => {
        const offset = this._calcOffset();
        const bars = [];

        bars.push(this._renderBar(0, 0, offset));
        bars.push(this._renderBar(1, offset, 100));

        return bars;
    };

    _renderInputOutput() {
        let label = this.props.label ? <span className={this.props.labelClassName}>{this.props.label}</span> : null;
        let labelSmall = this.props.labelSmall ? <span className="slider__label--small">
        <small>{this.props.labelSmall}</small>
    </span> : null;
        let prefix = this.props.valuePrefix ?
            <span className="slider__value--prefix">{this.props.valuePrefix}</span> : null;

        let suffix = this.props.valueSuffix ?
            <span className="slider__value--suffix">{this.props.valueSuffix}</span> : null;

        if (this.props.editable) {
            return (
                <div className={this.props.inputClassName}>
                    {label}
                    <div className="slider__value-prefix-suffix">
                        {prefix}
                        <input
                            className="slider__value"
                            value={this.state.enteredValue}
                            type="number" ref="input"
                            min={this.props.min}
                            max={this.props.max}
                            onChange={this._onInputChange}
                            onFocus={this._onInputFocus}
                            onBlur={this._onInputBlur}
                            onKeyUp={this._onKeyUp}
                        />
                        {suffix}
                    </div>
                    {labelSmall}
                </div>
            );
        }
        return (
            <div className={this.props.outputClassName}>
                {label}
                <div className="slider__value-prefix-suffix">
                    {prefix}
                    <span className="slider__value">{this.state.value}{suffix}</span>
                </div>
                {labelSmall}
            </div>
        );
    }

    render() {
        let bars = this._renderBars();
        let handle = this._renderHandle();
        let output = this._renderInputOutput();

        let sliderClass = cx({
            [this.props.className]: true,
            ['disabled']: this.props.disabled
        });

        return (
            <div className={this.props.containerClassName}>
                {output}
                <div className="slider__holder">
                    <div
                        className={sliderClass}
                        ref="slider"
                        onMouseDown={this._onSliderMouseDown}
                        onClick={this._onSliderClick}
                    >
                        {bars}
                        {handle}
                    </div>
                </div>
            </div>
        );
    }
}