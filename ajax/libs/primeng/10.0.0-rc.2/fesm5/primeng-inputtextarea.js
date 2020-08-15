import { EventEmitter, ElementRef, Optional, Directive, Input, Output, HostListener, NgModule } from '@angular/core';
import { NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';

var InputTextarea = /** @class */ (function () {
    function InputTextarea(el, ngModel) {
        this.el = el;
        this.ngModel = ngModel;
        this.onResize = new EventEmitter();
    }
    InputTextarea.prototype.ngDoCheck = function () {
        this.updateFilledState();
        if (this.autoResize) {
            this.resize();
        }
    };
    InputTextarea.prototype.onInput = function (e) {
        this.updateFilledState();
        if (this.autoResize) {
            this.resize(e);
        }
    };
    InputTextarea.prototype.updateFilledState = function () {
        this.filled = (this.el.nativeElement.value && this.el.nativeElement.value.length) || (this.ngModel && this.ngModel.model);
    };
    InputTextarea.prototype.onFocus = function (e) {
        if (this.autoResize) {
            this.resize(e);
        }
    };
    InputTextarea.prototype.onBlur = function (e) {
        if (this.autoResize) {
            this.resize(e);
        }
    };
    InputTextarea.prototype.resize = function (event) {
        this.el.nativeElement.style.height = 'auto';
        this.el.nativeElement.style.height = this.el.nativeElement.scrollHeight + 'px';
        if (parseFloat(this.el.nativeElement.style.height) >= parseFloat(this.el.nativeElement.style.maxHeight)) {
            this.el.nativeElement.style.overflowY = "scroll";
            this.el.nativeElement.style.height = this.el.nativeElement.style.maxHeight;
        }
        else {
            this.el.nativeElement.style.overflow = "hidden";
        }
        this.onResize.emit(event || {});
    };
    InputTextarea.ctorParameters = function () { return [
        { type: ElementRef },
        { type: NgModel, decorators: [{ type: Optional }] }
    ]; };
    InputTextarea.decorators = [
        { type: Directive, args: [{
                    selector: '[pInputTextarea]',
                    host: {
                        '[class.p-inputtextarea]': 'true',
                        '[class.p-inputtext]': 'true',
                        '[class.p-component]': 'true',
                        '[class.p-filled]': 'filled',
                        '[class.p-inputtextarea-resizable]': 'autoResize'
                    }
                },] }
    ];
    InputTextarea.ctorParameters = function () { return [
        { type: ElementRef },
        { type: NgModel, decorators: [{ type: Optional }] }
    ]; };
    InputTextarea.propDecorators = {
        autoResize: [{ type: Input }],
        onResize: [{ type: Output }],
        onInput: [{ type: HostListener, args: ['input', ['$event'],] }],
        onFocus: [{ type: HostListener, args: ['focus', ['$event'],] }],
        onBlur: [{ type: HostListener, args: ['blur', ['$event'],] }]
    };
    return InputTextarea;
}());
var InputTextareaModule = /** @class */ (function () {
    function InputTextareaModule() {
    }
    InputTextareaModule.decorators = [
        { type: NgModule, args: [{
                    imports: [CommonModule],
                    exports: [InputTextarea],
                    declarations: [InputTextarea]
                },] }
    ];
    return InputTextareaModule;
}());

/**
 * Generated bundle index. Do not edit.
 */

export { InputTextarea, InputTextareaModule };
//# sourceMappingURL=primeng-inputtextarea.js.map
