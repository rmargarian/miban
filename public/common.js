(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["common"],{

/***/ "./src/app/components/answer-input-base/array-answer-input/index.ts":
/*!**************************************************************************!*\
  !*** ./src/app/components/answer-input-base/array-answer-input/index.ts ***!
  \**************************************************************************/
/*! exports provided: ArrayControl, ArrayTypeRequiredValidator */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ArrayControl", function() { return ArrayControl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ArrayTypeRequiredValidator", function() { return ArrayTypeRequiredValidator; });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
var __importDefault = (undefined && undefined.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { "default": mod };
};

var ArrayControl = /** @class */ (function () {
    function ArrayControl(options, optionsAnswers, validators) {
        var groupObject = {};
        options.forEach(function (option) {
            var answer = optionsAnswers.find(function (a) { return a.question_answer_options_id === option.id; });
            groupObject[option.id] = new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](answer ? answer.label_set_options_id : undefined);
        });
        return new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormGroup"](groupObject, validators);
    }
    return ArrayControl;
}());

function ArrayTypeRequiredValidator(c) {
    for (var k in c.value) {
        if (c.value.hasOwnProperty(k) && !c.value[k]) {
            return {
                allOptions: true
            };
        }
    }
    return null;
}


/***/ }),

/***/ "./src/app/components/answer-input-base/multi-choices-multi-options/index.ts":
/*!***********************************************************************************!*\
  !*** ./src/app/components/answer-input-base/multi-choices-multi-options/index.ts ***!
  \***********************************************************************************/
/*! exports provided: MultiOptionsControl, MultiOptionsTypeRequiredValidator */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MultiOptionsControl", function() { return MultiOptionsControl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MultiOptionsTypeRequiredValidator", function() { return MultiOptionsTypeRequiredValidator; });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
var __importDefault = (undefined && undefined.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { "default": mod };
};

var MultiOptionsControl = /** @class */ (function () {
    function MultiOptionsControl(options, selectedValues, valueField, validators) {
        var groupObject = {};
        options.map(function (item) {
            groupObject[item[valueField]] = new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](selectedValues.indexOf(item[valueField]) !== -1);
        });
        return new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormGroup"](groupObject, validators);
    }
    return MultiOptionsControl;
}());

function MultiOptionsTypeRequiredValidator(min) {
    var validator = function (formArray) {
        var selectedCount = 0;
        for (var key in formArray.value) {
            if (formArray.value.hasOwnProperty(key) && formArray.value[key] && ++selectedCount >= min) {
                return null;
            }
        }
        if (selectedCount > 0) {
            return { requiredOptions: true };
        }
        return { oneOption: true };
    };
    return validator;
}


/***/ })

}]);
//# sourceMappingURL=common.js.map