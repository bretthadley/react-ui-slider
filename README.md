# react-ui-slider

React JS slider similar to jQuery UI slider. Built with ES6/ES2015.

### TODO
This is currently in product use. I just need to document everything. If you're feeling up to the challenge try figure out some options for yourself by reading the code.

### Demo
http://bretthadley.github.io/react-ui-slider/demo/

# TODO
* tests
* align input value to a step (make optional)
* extract out bar / handle into leaf components
* refactor align value isArray stuff (not consistent with last index)
* add forceUpdate hook to for parent component
* add some hooks to get the value back from parent

### Installation

```sh
npm install react-ui-slider
```

### Properties

```javascript
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
```

### Default Props

BEM style CSS

```javascript
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

```
