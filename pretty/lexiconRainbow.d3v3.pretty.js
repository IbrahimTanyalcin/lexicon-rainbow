(function(root, factory) {
    if (typeof root.window === "object" || root.document === "object") {} else {
        var __f = function() {};
        var __o = {};
        root.window = {
            requestAnimationFrame: __f,
            addEventListener: __f,
            document: {
                getElementById: __f,
                querySelector: __f,
                querySelectorAll: __f,
                elementFromPoint: __f,
                head: __o,
                body: __o
            }
        }
    }
    if (typeof define === "function" && define.amd) {
        define(["d3"], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(require("d3"), root.window, root.window.document);
    } else {
        root.LexiconRainbow = factory(root.d3, root, root.document);
    }
}(this, function(d3, window, document) {
    function LexiconRainbow() {
        var documentById = document.getElementById.bind(document);
        var documentQuery = document.querySelector.bind(document);
        var ceil = Math.ceil;
        var floor = Math.floor;
        var round = Math.round;
        var abs = Math.abs;
        var max = Math.max;
        var min = Math.min;
        var ID = ID || "lexicon_" + round(Math.random() * 100);
        var viewport = undefined;
        var viewportBackground = undefined;
        var viewportFront = undefined;
        var viewportTemporary = undefined;
        var viewportOrdinal = undefined;
        var viewportLinear = undefined;
        var gStackObj = {};
        var gModeCondition = undefined;
        var scaleInTransition = false;
        var scaleTimeout = false;
        var _input_ = undefined;
        var attrX = attrX || 0;
        var attrY = attrY || 0;
        var attrW = attrW || 100;
        var attrH = attrH || 100;
        var styleW = styleW || "100px";
        var styleH = styleH || "100px";
        var styleMargin = styleMargin || "0px";
        var bColor = bColor || "DimGray";
        var bOpacity = bOpacity || 0;
        var gradientColors = ["Black", "Black", "Black"]; //start, merge, stop
        var _tagColors_ = ["Black", "AntiqueWhite"]; //[backgroundColor,textColor]
        var guiColor = "Black";
        var guiIsOn = true;
        var axisSelectorText = "svg[data-lexType='lexiconRainbow'] .global_lexScaleAxes .tick line," +
            "svg[data-lexType='lexiconRainbow'] .global_lexScaleAxes path," +
            "svg[data-lexType='lexiconRainbow'] .global_lexScaleAxes .tick text," +
            "svg[data-lexType='lexiconRainbow'] .global_lexScaleAxes text";
        var _container_ = _container_ || document.body;
        var position = position || "relative"
        var top = top || "0px";
        var left = left || "0px";
        var offset = 0;
        var line = d3.svg.line();
        var basis = d3.svg.line().interpolate("basis");
        var colorScale20 = d3.scale.category20();
        var _this_ = this;
        var ordinalID = 0;
        var linearID = 0;
        var ordinalRect = undefined;
        var handleEvent = (function() {}).bind(_this_);
        var dispersion = 0.01;
        var currentHovered = null;
        var glyphBlurStd = 0.01;
        var enableOnPick = true;
        var shapeRendering = "auto";
        var canvas = undefined;
        ////////////////////////////////////////////////////////////////////
        //////////////////INNER VARIABLE ACCESS FROM PROTO//////////////////
        ////////////////////////////////////////////////////////////////////
        this.getNSet = {};
        ! function(obj) {
            var list = {
                "guiColor": function(g, v) {
                    if (g) {
                        return guiColor
                    } else {
                        return guiColor = v;
                    }
                },
                "guiIsOn": function(g, v) {
                    if (g) {
                        return guiIsOn
                    } else {
                        return guiIsOn = v;
                    }
                },
                "attrX": function(g, v) {
                    if (g) {
                        return attrX
                    } else {
                        return attrX = v;
                    }
                },
                "attrY": function(g, v) {
                    if (g) {
                        return attrY
                    } else {
                        return attrY = v;
                    }
                },
                "attrW": function(g, v) {
                    if (g) {
                        return attrW
                    } else {
                        return attrW = v;
                    }
                },
                "attrH": function(g, v) {
                    if (g) {
                        return attrH
                    } else {
                        return attrH = v;
                    }
                },
                "canvas": function(g, v) {
                    if (g) {
                        return canvas
                    } else {
                        return canvas = v;
                    }
                },
                "shapeRendering": function(g, v) {
                    if (g) {
                        return shapeRendering
                    } else {
                        return shapeRendering = v;
                    }
                },
                "input": function(g, v) {
                    if (g) {
                        return _input_
                    } else {
                        return _input_ = v;
                    }
                },
                "handleEvent": function(g, v) {
                    if (g) {
                        return handleEvent
                    } else {
                        return handleEvent = v;
                    }
                }
            };
            for (var i in list) {
                getNSet(obj, i);
            }

            function getNSet(o, p) {
                getNSet.desc = getNSet.desc || {
                    configurable: true,
                    enumerable: true,
                }
                getNSet.desc.get = function() {
                    return list[p](true)
                }
                getNSet.desc.set = function(v) {
                    return list[p](false, v)
                } //should always return but just to be explicit
                Object.defineProperty(o, p, getNSet.desc);
            }
        }(this.getNSet);
        ////////////////////////////////////////////////////////////////////
        //////////////////INNER VARIABLE ACCESS FROM PROTO//////////////////
        ////////////////////////////////////////////////////////////////////
        this.toggleGUI = function(bool) {
            /*there are 11 GUI elements with GUI class that needs to be taken into account, their order in document TRAVERSAL:
            (!opacity = do not change opacity;!fill = do not change fill; !!deprc = depreciated) 
            0- large RECT behind containerImage with linear gradient fill -!fill;!!deprc
            1- top right long RECT gradient background -!fill;!!deprc
            2(0)- top right long RECT 
            3- bottom right long RECT gradient background -!fill;!!deprc
            4(1)- bottom right long RECT
            5(2)- ordinal G controller -!fill
            6(3)- ordinal g RECT -!opacity
            7(4)- linear G controller -!fill
            8(5)- linear g RECT -!opacity
            9(6)- image G controller -!fill
            10(7)- image g RECT -!opacity
            */
            guiIsOn = bool ? true : false;
            var selection = d3.selectAll("#" + ID + " .GUI");
            selection.filter(function(d, i) {
                    return !~[3, 5, 7].indexOf(i)
                }).transition("fade").attr("fill-opacity", function() {
                    return bool ? 0.8 : 0
                })
                .on("start", function() {
                    bool ? this.style.visibility = "visible" : void(0);
                })
                .on("end", function() {
                    !bool ? this.style.visibility = "hidden" : void(0);
                })
                .delay(0).duration(1000);
            selection.filter(function(d, i) {
                return !~[2, 4, 6].indexOf(i)
            }).transition("color").attr("fill", guiColor).delay(0).duration(1000);
        }
        this.toggleAxis = function(bool) {
            var axis = documentById(ID).querySelectorAll(axisSelectorText);
            if (bool) {
                typeof bool === "string" ?
                    Array.prototype.forEach.call(axis, function(d) {
                        d.style.fill = bool;
                        d.style.opacity = 0.8;
                    }) :
                    Array.prototype.forEach.call(axis, function(d) {
                        d.style.opacity = 0.8;
                    })
            } else {
                Array.prototype.forEach.call(axis, function(d) {
                    d.style.opacity = 0;
                })
            }
        }
        this.setViewBox = function(x, y, w, h) {
            return x + " " + y + " " + (x + w) + " " + (y + h)
        }
        this.setCanvasDims = function(w, h) {
            this.getNSet.canvas.attr("width", w).attr("height", h)
        }
        this.lexID = function(u) {
            if (arguments.length !== 0) {
                ID = u;
                return this;
            } else {
                return ID;
            }
        }
        this.x = function(u) {
            attrX = u;
            return this;
        }
        this.y = function(u) {
            attrY = u;
            return this;
        }
        this.w = function(u) {
            attrW = u;
            return this;
        }
        this.h = function(u) {
            attrH = u;
            return this;
        }
        this.sW = function(u) {
            styleW = u;
            return this;
        }
        this.sH = function(u) {
            styleH = u;
            return this;
        }
        this.position = function(u) {
            position = u;
            return this;
        }
        this.color = function(u) {
            bColor = u;
            return this;
        }
        this.colorScale = function(f) {
            colorScale20 = f;
            return this;
        }
        this.opacity = function(u) {
            bOpacity = u;
            return this;
        }
        this.container = function(u) {
            _container_ = u;
            return this;
        }
        this.sTop = function(u) {
            top = u;
            return this;
        }
        this.sLeft = function(u) {
            left = u;
            return this;
        }
        this.sMargin = function(u) {
            styleMargin = u;
            return this;
        }
        this.input = function(input) {
            if (arguments.length !== 0) {
                _input_ = input;
                return this;
            } else {
                return _input_;
            }
        }
        this.handleEvent = function(f) {
            if (typeof f === "function") {
                handleEvent = f.bind(_this_);
                return this;
            } else if (arguments.length === 0) {
                return handleEvent
            } else {
                console.log("Argument is not a function, ignored.");
                return this;
            }
        };
        this.dispersion = function(u) {
            dispersion = u;
            return this;
        }
        this.enableOnPick = function(u) {
            enableOnPick = u;
            return this;
        }
        var _objSync_ = []; //needed because synctor recursively checks 
        this.sync = function() {
            return _objSync_;
        } ////needed because synctor recursively checks 
        this.forceStyle = function() {
            if (document.querySelector("head style[data-lexType='lexiconRainbow']")) {
                return this;
            }
            d3.select(document.head).append("style").attr("type", "text/css").attr("data-lexType", "lexiconRainbow").node().innerHTML =
                "svg[data-lexType='lexiconRainbow'] text {" +
                "-webkit-user-select: none;" +
                "-moz-user-select: none;" +
                "-ms-user-select: none;" +
                "user-select: none;" +
                "}" +
                axisSelectorText + "{" +
                "font: 10px sans-serif;" +
                "fill: AntiqueWhite;" +
                "stroke: AntiqueWhite;" +
                "opacity:0.8;" +
                "shape-rendering: crispEdges;" +
                "stroke-width: 0px;" +
                "transition: fill 0.5s ease, opacity 0.5s ease;" +
                "}" +
                "svg[data-lexType='lexiconRainbow'] g[class $= '_ordinalSolidCurves'] path{" +
                "stroke-linejoin: round;" +
                "}" +
                "svg[data-lexType='lexiconRainbow'] .global_lexScaleAxes path{" +
                "stroke-width: 5.5px;" +
                "}" +
                "@font-face{" +
                "font-family: 'advent-pro';" +
                "src: url('data:font/ttf;charset=utf-8;base64,AAEAAAARAQAABAAQRFNJRwAAAAEAALjEAAA" +
                "ACEZGVE1fekGyAACoUAAAABxHREVGACgBwQAAqGwAAAAoR1BPU1Enlx4AAKiUAAAQBEdTVUIWbSh3AAC" +
                "4mAAAACpPUy8yemzdMwAAAZgAAABgY21hcP/iHw8AAAhoAAADdmdhc3AAAAAQAACoSAAAAAhnbHlmNNj" +
                "/8AAADyQAAIiYaGVhZPzSXqkAAAEcAAAANmhoZWELEwgPAAABVAAAACRobXR4A5BgiwAAAfgAAAZwbG9" +
                "jYXbEU84AAAvoAAADOm1heHAB5QBMAAABeAAAACBuYW1ld+UlPAAAl7wAAAbecG9zdL7lSo8AAJ6cAAA" +
                "JqXByZXBoBoyFAAAL4AAAAAcAAQAAAAIAgzqW5sJfDzz1AAsD6AAAAADK+KMWAAAAAMttd0L/3P8lB3A" +
                "DxAAAAAgAAgAAAAAAAAABAAADxP8YAAAHhf/c/9UHcAABAAAAAAAAAAAAAAAAAAABnAABAAABnABJAAc" +
                "AAAAAAAIAAAABAAEAAABAAAAAAAAAAAIBhQGQAAUAAAKKAlgAAABLAooCWAAAAV4AMgD6AAACAAUGBAA" +
                "AAgAEgAAArxAAIEoAAAAAAAAAAEFEQkUAQAAg+wQDxP8YAAADxADoAAAAmwAAAAAB9QK8AAAAIAACAfQ" +
                "AAAAAAAABTQAAARYAAADhAE4BqgBpAmUAIgIcACICoAAiAiQAIwCsAC4BGQBOARkATgFgABgBgQAiAJ8" +
                "ACwGaAC0AeAALAa0AGAIlAD8A0QAYAY8AGAG2ABgB7QAYAbYAGAHZABgBugAYAdoAGAHZABgAcgAYAJk" +
                "AGAFtABgBcAAYAW0AGAGTABgCwwAYAg8ADAIgAE4BtABCAkAATgHRAE4BvQBOAhkAQQJMAE4BCABCAMQ" +
                "ADgHbAE8BuABOArYATgKKAE4CJQA/AiEATgIlAD8CNABOAjEAJQGSAAACNgBKAk0ATgMnAE4CdABOAjA" +
                "APAImAB8BPwBOAewARgE/AE4BkQBOAWEATADeAC4BygAlAeAATgF/ACQB4ABOAbIAIwEmAE4BwAAlAe0" +
                "AQADhAE4Awf/5AbIAQwDWAE4C3wBOAfQAQAHkAE4B6ABOAcAAJQFNAD0BrwAkAPMALAG/ACQBqAASAsA" +
                "AEgHpAE4B4AAlAd4ATgE1AE4A1gBOATUATgIEAE4A4QBOAbEATgHXAE4BzgBOAkcATgJKAE4A3gAAAyA" +
                "AGQF8AE4B6AAqAZoALQMgABkBTABOAY8ATgGvAE4A3gAuAd4AJQKdAE4A+QBMAgAAAwHSAE8CDwAMAg8" +
                "ADAIPAAwCDwAMAg8ADAIPAAwDLABOAbQAQgHRAE4B0QBOAdEATgHRAE4BIgBOAV4ATgHAAE4BfABOAn4" +
                "ATgKKAE4CJQA/AiUAPwIlAD8CJQA/AiUAPwGLAE4CEwBOAjYASgI2AEoCNgBKAjYASgIwADwB6ABOAf8" +
                "ATgHwAE4B8ABOAfAATgHwAE4B8ABOAfAATgMhAE4BfwAkAdcATgHXAE4B1wBOAhkAIwD1AE4A7QBOAN/" +
                "/3AFNAE4B4ABOAeQATgHkAE4B5ABOAeQATgHkAE4BrwBOAeQATgHkAE4B5ABOAeQATgHkAE4CCABOAeg" +
                "ATgIIAE4CDwAMAfAATgIPAAwB8ABOAooATgHsACUBtABCAbEATgG0AEIBsgBOAbQAQgGxAE4BtABCAbI" +
                "ATgJAAE4CYgBOAkAATgIeAE4B0QBOAhkAIwHRAE4B1wBOAfEATgGyACMB0QBOAdcATgIZAEEB6QBOAhk" +
                "AQQHoAE4CNgBBAegATgIZAEEB6ABOAkwATgJiAEACrQBOAh4ATgHsAE4BvQBOAXYATgFIAE4BWwBOAPX" +
                "/+QEfAE4AggAkAQn//AGRAE4B2wBPAbIAQwHhAE4BuABOAR4ATgG4AE4BBwBOAisATgHAAE4CUwBOAak" +
                "ATgKKAE4B4ABOAooATgH0AEACigBOAeAATgKLAE4B9ABAAiUAPwHkAE4CJQA/AeQATgMoAE4DFQBOAjQ" +
                "ATgFpAE4CNABOAU0APQI0AE4BkQBOAjEAJQHXAE4CMQAlAdcATgGvACQCMQAlAdcATgGSAAABBwAsAZI" +
                "AAAFlACwBkgAAAWUATgI2AEoB5ABOAjYASgHkAE4CNgBKAeQATgI2AEoB5ABOAjYASgHkAE4CNgBKAeE" +
                "AJAIwADwCJgAfAd4ATgImAB8B3gBOAiYAHwHeAE4CMQAlAa8AJAGKAC4BigAuAUoALgBDAAAA3v/+AN4" +
                "ATAG9AE4A4v/+AU0ATgJoAE4CZABOAsYATgGGAE4CiABOAsoATgLPAE4BTQBOAgsADAIgAE4BvQBOAgs" +
                "ADAG9AE4CVgBOAkUAUAJTAI4BEgBQAfwATgILAAwCrwBQAoMAUAJsAE4CHwA+AkUAUAIhAE4CQwBOAgE" +
                "ATgIsADwCfgBOAmoATgJ4AD0BdQBQAfsAAgH6AE4ByABOAeAATgDvAE4B6wBOAfoATgHhAE4B3wAVAeQ" +
                "ATgHIAE4B0wBOAeAATgH3AD4AnwBCAeEATgI+AE4CBgBOAfAATgGdAE4B5ABOAf8AQgHkAE4BmQBOAhQ" +
                "ATgGcAE4B4wBCAn4ATgJBAE4CfwBOAnsAQgEUABUB6wBOAeQATgHrAE4CgwBOAGX//wBl//4AnwALAPz" +
                "//wD8//4BNgALAdQATgHdAAsEFwBOAQwAKgEkAAMB7ABOAg8ATgJJAGkCcQBOAmgATgIhAE4BiwBOAYs" +
                "ATgJxAE4BFgAAAisATgJoAE4HhQASAgMATgHeACwB+wACAgIADQH2//0B+wACAf0ACAH3AAIB+QAAAPI" +
                "ATgPhAE4DNgBOA9kATgNvABUDkgBOAtgATgAAAAMAAAADAAAAHAABAAAAAAFsAAMAAQAAABwABAFQAAA" +
                "AUABAAAUAEAB+AKUAqwCxALYAuAC7AO8BEwErATEBPgFIAU0BXQFzAX4CGQLHAt0DhgOKA4wDoQOoA84" +
                "gGiAeICIgJiAwIDogRCCsISIhJiIG+wL7BP//AAAAIAChAKcArQC0ALgAuwC/APEBFgEuATQBQQFKAVA" +
                "BXwF4AhgCxgLYA4UDiAOMA44DowOqIBggHCAiICYgMCA5IEQgrCEiISYiBvsA+wT////j/8H/wP+//73" +
                "/vP+6/7f/tv+0/7L/sP+u/63/q/+q/6b/Df5h/lH9qv2p/aj9p/2m/aXhXOFb4VjhVeFM4UThO+DU4F/" +
                "gXN99BoQGgwABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgIKAAAAAAEAAAEAAAAAAAAAAAAAAAAAAAABAAI" +
                "AAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAADAAQABQAGAAcACAAJAAo" +
                "ACwAMAA0ADgAPABAAEQASABMAFAAVABYAFwAYABkAGgAbABwAHQAeAB8AIAAhACIAIwAkACUAJgAnACg" +
                "AKQAqACsALAAtAC4ALwAwADEAMgAzADQANQA2ADcAOAA5ADoAOwA8AD0APgA/AEAAQQBCAEMARABFAEY" +
                "ARwBIAEkASgBLAEwATQBOAE8AUABRAFIAUwBUAFUAVgBXAFgAWQBaAFsAXABdAF4AXwBgAGEAAAB7AHw" +
                "AfgCAAIgAjQCTAJgAlwCZAJsAmgCcAJ4AoACfAKEAogCkAKMApQCmAKcAqQCoAKoArACrALAArwCxALI" +
                "AAABvAGMAZABnAXoAcwCWAG0AaQGBAHEAaAAAAH0AjwAAAHAAAAAAAGYAcgAAAAAAAAFlAAAAagAAAAA" +
                "AnQCuAHYAYgAAAAAAAAAAAYMAawB1AXsAAAB3AHoAjAD9AP4AAAAAAXcBeAF0AXUArQAAALUBHgF/AYA" +
                "BfQF+AYUBhgAAAAABdgF5AXwAeQCBAHgAggB/AIQAhQCGAIMAigCLAAAAiQCRAJIAkADjAScBLQBuASk" +
                "BKgErAHQBLgEsASgAALgB/4WwBI0AAAAAKAAoACgAKABCAGYAlgDgARwBcAGGAaABugHYAewCCAIWAig" +
                "CNgJgAngCngLEAt4DAgM0A0YDgAOsA8oD8AQEBBgEKgRiBMQE3gUSBT4FXAV0BYgFtAXMBdoF8gYMBhw" +
                "GNgZMBnYGngbeBwwHQAdQB3IHhAegB7wH4gf6CAwIGggsCD4ITAhiCJwIxgjsCRYJRAliCZIJsgnMCfI" +
                "KDAoYCkwKbAqQCroK5Ar+CzALSAtmC3gLlAusC9gL8AwcDCgMUgxwDIwMwAzwDSYNTg2eDbwN/g4sDko" +
                "OWA6aDqgOxg7gDvYPIA9ED2gPhg++D+YQDhAyEGQQlBDEEOgRLhFWEXwRnhHMEeoSBhIgEkQScBKgEtg" +
                "TEBNEE4YTxhPgFB4UUBSAFKwU5BUaFT4VihXUFh4WZBa4FwoXWhewF/gYNhhyGKoY7hkKGSYZPhliGZw" +
                "Z0BoEGjQachquGtIbDBs4G2QbjBvAG/ocHhxgHIAcwBzuHTwdbB2+HfgeLh5kHpYezh8AHzYfaB+SH9A" +
                "f9CAmIEQgeCCcINYhBCFIIWohoiHYIhQiVCKYItAjDCNMI5IjtCPgJAQkLCRUJHokjiSiJMYk9CUOJRo" +
                "lRiVsJZolyiXqJggmIiZGJmgmgiaYJrQmzibyJyAnTCeCJ6Inzif2KCIoUih8KMIpBCk+KYQpwCnoKio" +
                "qWiqSKrYq+is6K3oruCwILEgshiysLNgs8i0ULSotSi2ELbot4i4GLjwubi6mLtovGC9SL4QvuC/2MBw" +
                "wQjBmMIgwqjDMMRYxXDFuMYAxnDGuMcwx6jIKMi4yWjKCMqgyzjLsMyQzWDOgM9Az6jQeNC40QjRaNHI" +
                "0ijS6NMg04jT0NQ41JDVONXg1ijWyNdI15DYKNkY2YjaWNrw26DcyN3Y3pDfAN/44Ojh6OLA46DkgOUw" +
                "5bjmyOb453joUOj46UDqIOqw6zDr0OyY7Yjt6O5Q7zjv2PCo8XDx+PK484D0IPUg9ZD2APZw9zD38Piw" +
                "+Pj5mPro+zD7ePuw/Jj9EP34/kj/IP+xADEBEQERAgkCWQPpBJkFUQWpBfkGqQc5B8EIaQjBCTEKyQwJ" +
                "DakPYRChETAAAAAMAAAAAAfQCvAADAAcAEwAAISERIQMRIRElBycHJzcnNxc3FwcB9P4MAfQy/nABdye" +
                "IiSiTkyiJiCeRArz9dgJY/ahTIMzNHd3dHc3MINkAAgBOAAAAkQLGAAUADQAANyMDNDIVAiImNDYyFhS" +
                "ILwpCFRoUFBoUeAIpJST9XhQaFBQaAAIAaQIAAT4C4AAJABMAABMjJzQ3NjMXFhUXIyc0NzYzFxYVnyg" +
                "OEQgJERGDKA4RCQgREQIAvBYJBQUJFry8FgkFBQkWAAAAAAIAIgAAAkYCvAAbAB8AACUjByM3IwcjNyM" +
                "1MzcjNTM3MwczNzMHMxUjBzMjNyMHAkbHLDcsdyw3LHiFKK26Njc2dzY3NoWSKLrxKHcovb29vb04qDj" +
                "n5+fnOKioqAAAAAMAIv+OAf0DMQAiACgALgAABSM1JiYnMxYWFxEmJyY1NDY3NTMVFhcUByYnERYXFhU" +
                "UBgcRETY2NCYnNQYGFBYBKzhhbgI5BFJCUTI8Yl04RDgRMDt+KStmbEJUTYE+R0VyaAhvRTBPBwE2HCI" +
                "rTz9jCG1sAhsCMxkD/vsrLTFBV2wHAVj+3gdFe0Bq8Qg9XzYAAAAFACL/9QKBAuQAAwALABMAGwAjAAA" +
                "3JwEXAiImNDYyFhQmNCYiBhQWMgAiJjQ2MhYUJjQmIgYUFjJFIwI3KFZ4VFR4VDI0VDQ0VP7beFRUeFQ" +
                "yNFQ0NFQBKAK7Kf06VHhUVHgXSjk5SjkBkFR4VFR4F0o5OUo5AAACACP/9QIFAscALAA3AAAlByYmJwY" +
                "jIicmNTQ+AjcmJyY1NDc2MhcHJiIHBhUUFxYyNzc1MxU3FwcRFCc1BgcGBwYUFjI2AfIQJjUHOnFaLyk" +
                "uRTcoIRofQCtTJB8XNhskMh0tDhs5SQxVOZJDGxUYQIZXICsLMyRiPzdIP1o3HxEFICU5TCobDC4HFB0" +
                "rPRsQAwWJfRA1E/7hV6XFITUWIiluUGsAAAABAC4CTQByAuAACQAAEyMnNDc2MxcWFWQoDhEJCBERAk1" +
                "vFgkFBQkWAAAAAAEATv+JAMkDMQANAAAXByYmNRE0NjcXBhURFMkSOTAwORJDUiUhT04CLE5PISUyXv3" +
                "CXgABAE7/iQDJAzEADQAAFyc2NRE0JzcWFhURFAZgEkNDEjkwMHclMl4CPl4yJSFPTv3UTk8AAQAYAaM" +
                "BSAK8AA4AAAEHJwcnNyc3FzUzFTcXBwEdKUVBLUFqEmo1axRtAcIfYGAfWyYwKHFxKDAmAAAAAQAiAOE" +
                "BYgIhAAsAADcjNSM1MzUzFTMVI943hYU3hIThhTeEhDcAAAEAC/+sAHMAQgANAAAXJzY3NycmNjYyFhY" +
                "VFDMoLQ0FChIBEw4OFVQcGhQHAw0kEQEXDzoAAAAAAQAtAWYBbQGdAAMAAAEhNSEBbf7AAUABZjcAAAE" +
                "ACwAAAE0AQgAHAAAyIiY0NjIWFDocExMcExQaFBQaAAAAAAEAGP+OAZUDMQADAAAXIwEzVT0BRDlyA6M" +
                "AAAACAD//9QHjAswACwAXAAABERQGIiY1ETQ2MhYDETQmIgYVERQWMjYB43usfXHGbTdVjFRXh1cB+v6" +
                "/ZV9fZQFCZ2pw/l8BSUlKSkn+tkdJRwAAAAABABgAAAC5ArwACwAAMyMRBgYHBycyNjczuTgQLg8PDRY" +
                "/FDgCeg8XBAQ1IhkAAAABABgAAAF3AsYAFAAAISE1EzY1NCYiBgcnNjYyFxYUBwMhAXf+of4kR1A8DjQ" +
                "TU4UwNSzwAR41AYE6LTg8MCcUNUMqLodK/pcAAAAAAQAY//QBngK8ABcAADc3FjMyNjQmJyMTIzUhFQc" +
                "zMhYUBiMiJhgvLlRBXFg/bsHbAR+fAll8fFk2XlMeRVyAWwMBHzcx7nyxfDMAAAEAGAAAAdUCvAANAAA" +
                "hIxEhEzMDMxEzETMHIwGMOP7Ewjqc3DhJEzYBZgFW/uEBH/7hNwABABj/9AGeArwAFgAANzcWMzI2NCY" +
                "jIxMhFSMHMzIWFAYjIiYYLy5UQVxcQZAkAQnYGFNZfHxZNl5THkVcglwBVjfofLF8MwACABj/9AHBArw" +
                "AFgAgAAA3ETQ3NjYzMxUjIgYVFTY2MzIWFAYiJjcVFBYyNjQmIgYYMhtkQyMnS24VVTNZfH2wfDdbhFx" +
                "cglvJAQRTSCUvN2FeeiYrfLF8fF8GQlxchFtXAAAAAQAYAAABogK8AAYAADMjASE1IRVjPgE9/rYBigK" +
                "FNzcAAAAAAwAY//QBwgLFAAgAHAAlAAATBgYUFjI2NCY3FhYVFAYiJjU0NjcmNTQ2MhYVFAcyNjQmIgY" +
                "UFuY/V1yCXFwjMz58snw+NEtmk2a1NklIZUhEAWYDWoFcXIFaIRxjPFl8fFk9ZBszXUlnZ0leGkZlSEh" +
                "kRQACABgAAAHBAsYAFAAcAAAzIzUzMjY1NQYiJjQ2MhYVERQHBgYCMjY0JiIGFM0jJ0tuP7d8fLF8Mxp" +
                "kZYRbXINcN2Fea0R8sXx8Wf7+U0glLwFUW4dZXIQAAgAYAG8AWgGiAAcADwAAEiImNDYyFhQCIiY0NjI" +
                "WFEYaFBQaFBQaFBQaFAFgFBoUFBr++xMcExMcAAAAAgAY/6wAgAEzAAcAFQAANiImNDYyFhQDJzY3Nyc" +
                "mNjYyFhYVFGwcExMcEz8oLQ0FChIBEw4OFfETHBMTHP6oHBoUBwMNJBEBFw86AAEAGABQAVUCfQAGAAA" +
                "lBwE1ARcHAVUn/uoBFifxdiYBFgEBFibxAAACABgA/QFYAZ0AAwAHAAABITUhFSE1IQFY/sABQP7AAUA" +
                "BZjegNwAAAQAYAFABVQJ9AAYAADcnNyc3ARU/J/HxJwEWUCbw8Sb+6gEAAgAYAAABegLFAB0AJQAANyM" +
                "1ND4CNzY1NCYiBhUjNDYzMhcWFRQHDgMHBiImNDYyFhTXMxsgMwwhR2FHOF1VNCpSJRM2HRcBDRoUFBo" +
                "Ud10uSSc1ETMsNUQ/PUtmGzNePjYbNyBHNrYUGhQUGgAAAAIAGP++AqsCQwA3AEQAACUiJzU0NzYzMhc" +
                "mJiIGBwYVFRQWFjMyNjU1NDc2NxcGFRcUBgcGIiY1NTQ2NzY2MhYWFRcVJxEGEyYjIgYVFRYXFjMyNwF" +
                "AogtYIihJWwZTblAkTkdpQ3ScChEuDyIBPTJk9KskHjd0aWZAJSWIUFdWLDkBSRccPlc2lmVvIQ0sOjQ" +
                "RFCprmEddJVpTt0kYIw8mDzfVP2AaNHx9nzdWGS0aHFVDEDEQ/v0lATkrNjZiSxMGHQACAAwAAAIFArw" +
                "ABwAKAAAhIycjByMTMxMDAwIFPFDkTjvgNUlkYfX1Arz+cAE5/scAAAAAAwBOAAAB/wK8ABEAGQAhAAA" +
                "hIxEzMhYUBwYVFRYWFRQHBgYDMzI2NTQjIxEzMjU0JiMjATTm3VJeQgEsOykVU+ijOEB+nayRTDS9Arx" +
                "UsS0BAQEUWkhQOyAmAZ08OXX9rqBGSwAAAAABAEL/9gGrAsYAGwAAJQYjIi4CNRE0Njc2MzIXByYjIhU" +
                "RFBcWMzI3AatVTRBBSS0rLC0+TUEQOTOcfwoLPFUXIQYnVT8BQUxOGxkhJhWT/riDDAIeAAAAAgBOAAA" +
                "B8gK9AAgAEQAAISMRMzIWFREUJxE0JiMjETMyAR7QvHF3OGRCjoisAr18Z/7uyL4BJlRS/agAAQBOAAA" +
                "BnAK8AAsAACEhESEVIRUzByMRIQGa/rQBTv7qvxOsARQCvDTrN/7MAAAAAQBOAAABnAK8AAkAADMjESE" +
                "VIRUzByOGOAFO/uqrF5QCvDXqNwAAAAEAQf/2AdwCxQAcAAAhIycGIiY1ETQ3NjMyFwcmIyIVERQWMjY" +
                "1NSMnMwHcKQ40tXtXLT5NQRA5M5xXh1BCE4opM2RjATqANRkhJhWT/rtDTE5AOzcAAAABAE4AAAH8Arw" +
                "ACwAAISMRIREjETMRIREzAfw4/sI4OAE+OAFm/poCvP7hAR8AAAABAEIAAAC9ArwABQAAMyMRJzUzvTh" +
                "DewKJAjEAAQAO/9sAmQK8AAsAABcnMjY1ESc1MxEUBhsNITFDfEMlJTY8AhcCMf26SlEAAAAAAQBPAAA" +
                "B3AK9AAsAACEjAwcRIxEzERMzAwHcQ+IwODjgQc0BWUz+8wK9/rIBTv7RAAAAAAEATgAAAbcCvAAFAAA" +
                "hIREzESEBt/6XOAExArz9dgAAAQBOAAACZgK8AAwAACEjEQMjAxEjETMTEzMCZji2PbU4ONPVOAIX/ek" +
                "CF/3pArz9mgJmAAEATgAAAjoCvAAJAAAhIwERIxEzAREzAjo4/oQ4OAF8OAJV/asCvP2rAlUAAgA///U" +
                "B4wLMAAsAFwAAAREUBiImNRE0NjIWAxE0JiIGFREUFjI2AeN7rH1xxm03VYxUV4dXAfr+v2VfX2UBQmd" +
                "qcP5fAUlJSkpJ/rZHSUcAAAAAAgBOAAACAAK8AAsAGQAAEzMyNjY3NjU0JiMjESMRMzIWFRQOAyMjhsY" +
                "kMhgGCEU7wjj2X10DFCRIMsUBLB0kHyM3UVD9eQK8dGIjMUsvIwACAD//ogHjAswAFQApAAAFFSInJic" +
                "mJjURNDYyFhURFAYHFjMyNxE0JiIGFREUFhcmNTUzFRQXNjYBrHgqTjweI3HGbVtGG0sCAlWMVEc6BDg" +
                "DOUQoNlMCKxZOMwFCZ2pwYv6/V10MIeMBSUlKSkn+tkBJBhgiSUgpEQdHAAAAAAIATgAAAgECvAAQABw" +
                "AACEjJwYjIxUjETMyFhUUBgYHJTMyNjY3NjU0JiMjAgE5VRIWxTj2X10HKif+3sYkMhgGCEU7wvgD9QK" +
                "8dGIvQlcVIx0kHyM3UVAAAAAAAQAl//UCAALGACQAADczFhYyNjU0LgQ1NDYzMhcUByYiBhUUFx4EFRQ" +
                "GIiYlOQVhmGg7WGdYO3RtUz8ROZNcTyNVVkYsded9sjVSRUsuQSInJkw1RmYeAjMdQDlAJBAcIitKMFx" +
                "vcwABAAAAAAGSArwABwAAMyMRIzUhFSPiOKoBkrACijIyAAEASv/5Ae8CvQATAAAlETMRFA4CIi4CNRE" +
                "zERQWMjYBtzglP0ZQRz8lOFmCWrICC/39NU4qFBQqTjUCA/31PUpKAAAAAQBOAAACLAK8AAYAACEjAzM" +
                "TEzMBZE3JPLOzPAK8/YkCdwAAAQBOAAADBgK8AAwAACEjAwMjAzMTEzMTEzMCY1VjY1WlPI9rTmuNPAJ" +
                "X/akCvP2JAnf9iQJ3AAABAE4AAAJJArwACwAAISMDAyMTAzMTEzMDAklFuLlF3co/rK4/ywEm/toBYAF" +
                "c/toBJv6kAAAAAAEAPP/5AfgCvAAXAAAFJzY1NQYGIyImNTUzERQWMjY3ETMRFAYBjw09G1opans4YIh" +
                "YCzk3ByUXY44YGWln9/7/RkkyMgEs/eBJUwABAB8AAAIGArwACQAAISE1ASE1IRUBIQIG/hkBmv5zAdT" +
                "+ZgGgMgJXMzL9qQAAAAABAE7/jgDvAzEABwAAFyMRMxUHERfvoaFpaXIDoy0K/MsKAAABAEb/jgHDAzE" +
                "AAwAABSMBMwHDPf7AOXIDowAAAQBO/44A7wMxAAcAABcjNTcRJzUz76FpaaFyLQoDNQotAAAAAQBOAs8" +
                "BcAODAAUAAAEnByc3FwFKaW0mlI4Cz2hoJ42NAAAAAQBM/8kBjAAAAAMAAAUhNSEBjP7AAUA3NwAAAAE" +
                "ALgJOAKQC2wAKAAATIycmNTQ3NjMyF6QsRQUWBwYVCwJOXAYHGwcCFwAAAgAl//YBpgH9ABgAJgAABSI" +
                "1NTQ3NjMyFzQmIzcyFx4DFxYVEQY3ESYnJiMiBhUVFBcWMgEA20UkI3ZHQFsDUScVIBIMAgNoMFNXBgY" +
                "mNkgqagqzU2MiETg3QSsTCxYkGxcjJv7WCjgBASgHAS83V1MZDwACAE7/9AG/ArwADgAZAAATNjMyFxY" +
                "VFRQHBiInETMRERYzMjU1NCcmIoYxUzcpVU47klY4OC2dHCKHAdojEydpvWMoHgwCvP7t/ocJdbs0HSM" +
                "AAAABACT/9QFmAf4AFwAANzI3FwYiJyY1NTQ3NjMyFwcmIgYGFRUU9i03DEBoMmgcMG5CRBA5U0AsJg0" +
                "tERAijYBHMFMgKRYURjeRgwAAAgBO//QBvwK8AA4AGQAAATIXNTMRBiInJjU1NDc2FyYjIgYVFRQzMjc" +
                "BA1MxOFaSO05VKbs9SD8+nS04Af0j4v1EDB4oY71pJxNUIkA0u3UJAAAAAgAj//QBiwH+ABMAHQAANzI" +
                "3FwYjIjU1NDYyFhUVBRUUFxY3NTQmJiMiBhUVykVNFk1UrmWmXf7QJx6zLjIZN0glKSsvks1RWllPghE" +
                "9NhgT4VcrNw88QFgAAAABAE4AAAEFAscAEgAAMyMRNDY3NjMyFwcmIyIVFTMHI4Y4IhorLRIRCQ0MXXI" +
                "YWgIlMkgPGQQxAm8wNQACACX/LgGeAf4AEgAeAAAFJzY1NQYiJjU1NDYyFyczERQGAzU0JiIGFRUUFjI" +
                "2ATMPQiq1Yme0KgQ4MgZQbE1Hc0/SKxlPfElgXJVYYUM6/cs8RAFtoz49QUqZP0BFAAABAEAAAAGxArw" +
                "AEgAAEzYzMhcWFREjETQnJiIHESMRM3gyVTYnVTccIoc9ODgB2iQTJ2r+pgFXNB0jIv5XArwAAgBOAAA" +
                "AkQLGAAcACwAAEgYiJjQ2MhYDIxEzkRQbFBQcEwY4OAKXFBUaFBT9TgH1AAAAAAL/+f8vAIICxgANABU" +
                "AABcRJyczEQYGIycyNjc2EiImNDYyFhRELRd8AkQ2BwcgChoqGhUUGxQ4AfYDNP3AOkwrEAsdAvEVGhQ" +
                "UGwABAEMAAAGyArwADAAAISMDBxEjETMRNxcHFgGyQ8A0ODjIKJREAT0t/vACvP6TuSeBcQAAAQBOAAA" +
                "AhgK8AAMAADMjETOGODgCvAAAAQBOAAACvgH9ACAAAAE2MzIWFREjETQmJiIGBwcWFREjETQnJiIHESM" +
                "RMwc2MgGBVUxIVDcmNiEpIiURNxkeezw4OAVFjQHNMFxH/qYBVy04DgMNEiIs/qYBVzQdIiH+VwH1ICc" +
                "AAAABAEAAAAGxAf4AEgAAEzYzMhcWFREjETQnJiIHESMRM3QzXDQlVTccIoc9ODgB0ysTJ2r+pgFXNB0" +
                "jIv5XAfUAAgBO//YBwwIAAAsAFgAAARUUBiImNTU0NjIWBzU0IyIVFRQWMjYBw1y6X2GyYjiBhEd7QwE" +
                "8hFRub1OEX2Vp6Y6RkY48SkkAAgBO/y4BxwH9AA0AGQAAFwcRMwc2MhYVFRQGIiclNTQmIgYHFRQWMja" +
                "GODgFN65hZq0uAQlNa04DSnRLvBYCxzM7bFaLW2E2fJlJQkFFnkE+QQAAAgAl/y4BngH9AA0AGQAABSc" +
                "1BiImNTU0NjIXJzMDNSYmIgYVFRQWMjYBnjgurWZhrTgFODgDTmtNS3RK0hbmNmFbilZtPTX+sZ5FQUN" +
                "JmD5BPgAAAQA9AAABNwH9AA0AAAEmIgYVESMRMwc2MzIXASgmTj84OAMvTSInAcIKIyH+eAH1IysIAAE" +
                "AJP/xAYwCAQAgAAA3MxYWMjY0LgInJjQ2MzIWFxcHJiIGFRQeAxQGIiYkNQZOXUo5UlQgJlFbIDgMDBM" +
                "kbEFCVVQ6Watify0tKVMuGh0dImVXDwcHLhouJyYrGSBCblBSAAABACz/8wDcArwADAAANwcmJjURMxU" +
                "zByMRFKYQODI4eBhgHisQRjsCOMc1/sRQAAABACT/9QGZAfUAEQAAISM3BgYjIjURMxEUFjMyNREzAZk" +
                "3BBhJJbw4Rz2BODMeILcBSf6wQD5+AVAAAAABABIAAAGTAfUABgAAMyMDMxMTM/hNmTuFhjsB9f5FAbs" +
                "AAAABABIAAAKrAfUADAAAISMDAyMDMxMTMxMTMwIQTWVmTZk7hXE5boY7AZX+awH1/kUBu/5FAbsAAAE" +
                "ATgAAAcgB9QALAAAhIycHIzcnMxc3MwcByEJ7e0KcnD9+fj+dxcX5/MjI/AAAAAEAJf8uAb4B/gAbAAA" +
                "FJzY1NQYjIjURMxEUFjI2NTU0NzY3FwYVERQGATMPQyVfvjZGeUwKES4PIjDSKxlPcD28AUX+sUA/PkH" +
                "FSRgjDyYPN/4xPUYAAAABAE4AAAG9AfUACQAAISE1ASE1IRUBIQG9/pEBE/72AVH+6wEqMgGQMzL+cAA" +
                "AAAABAE7/jAEUAzYAGwAABQcmJjU1NCYmJzY2NTU0NjY3FwYVFRQHFhUVFAEUEkIoIBUVGDASKy0SRDo" +
                "8TyUmX3trEzEUExM+G2lUWzYaJTNduSs6PCq8XQAAAQBO/44AhgMxAAMAABcjETOGODhyA6MAAQBO/4w" +
                "BFAM2ABsAABcnNjU1NDcmNTU0JzceAhUVFBYXDgIVFRQGYBJEPDpEEi0rEjAYFRUgKHQlM128Kjw6K7l" +
                "dMyUaNltUaRs+ExMUMRNre18AAQBOARkB4wF7ABAAAAEyNxcGIyInJiMiByc2MzIWAXM2HxssRhxaHBs" +
                "5IxouRxt5AVYlJjkcCCcmOSIAAgBOAAAAkQLGAAUADQAANxMzExQiEiImNDYyFhRPCi8JQi0aFBQaFCU" +
                "CKf3WJAKEFBoUFBoAAAACAE7/jgGQAm8AGQAgAAAFIzUmJyYmNTU0Njc1MxUWFwcmJxEyNxcGBycRBgY" +
                "VFRQBJTcTHTs1WEg3NTQQMSgrNAw5MjcwOHJqAggUU0uAW2UIc3MGGCkSBP5bDS0PATQBnwlHP5FsAAE" +
                "ATgAAAbYCxQAfAAAhITU2NjU0JyM1MyY1NDYyFwcmIgYVFBczFSMWFAYHIQG2/pgzPw5NOyNtmSgSKW5" +
                "OKMm4DC8nARMyGl43HTE3azJXaxkxF09CIXo3LlNfGAAAAAIATgCUAa0B8wAXAB8AACUnBiInByc3JjQ" +
                "3JzcXNjIXNxcHFhQHFyY2NCYiBhQWAYkhMHktISAgIyIfIR8weC4gIh8jJSF6SEhlSEiWISMkIyEiMHU" +
                "vISEgJSMfIx8wdjAhFUZlSEhlRgAAAAEATgAAAiYCvAAZAAAhIzUjNTM1JyM1MwMzEzMTMwMzFSMHFTM" +
                "VIwFWOIODC3hYpT+oCKo/p1x8CYWF/TcgEjcBH/7hAR/+4TcQIjcAAAAAAgBO/zsCKQLIACoANwAAFzM" +
                "WFjI2NTQuBDQ3JjU0NjMyFxQHJiIGFRQXHgQUBxYVFAYiJiU2NTQmJyYnBhQWFxZOOQVhmGg7WGdYOyA" +
                "gdG1TPxE5k1xPI1VWRiwXF3XnfQGWB0cunDERSjCWCDVSRUsuQSInJkxpKSg3RmYeAjMdQDlAJBAcIit" +
                "KaysjM1xvc94aFzFFDzYgGkw9Dy0AAAIAAAKYAN4C2gAHAA8AABIiJjQ2MhYUFiImNDYyFhQuGhQUGhS" +
                "IGhQUGhQCmBQaFBQaFBQaFBQaAAAAAAMAGf+BAwYCbQAHAA8AJwAAJAYgJhA2IBYAFiA2ECYgBgUzBgY" +
                "jIiY0NjMyFhcjJiYjIgYUFjMyNgMG2v7J3NoBO9j9TrcBCre5/vm4AcNAEGxGY3NyYkluDD8ISjFMS05" +
                "KMklZ2NgBPtbW/tW0tQEQubPUSFeCxYdWRSg4YpNkOQAAAAIATgF8AVsCxQATAB0AAAEGIi4CNTQ3NjM" +
                "yFzQmIzcyFhUHNSYjIhUUFxYyAVtFPj0uHz4SFTJCNz4DYkQ0SSo3MRg8AYcLBhw8LVIXBycgKitLT3h" +
                "sKUc8EwoAAgAqAFAB5gHHAAYADQAAJQcnNTcXBwUHJzU3FwcBCCO7uyWWAXAju7sllnIiuwG7JpaZIrs" +
                "BuyaWAAAAAQAtAWYBbQGdAAMAAAEhNSEBbf7AAUABZjcAAAQAGf+BAwYCbQAMABYAHgAmAAAlIycjFSM" +
                "RMzIWFAYHJzMyNzY1NCYjIwAGICYQNiAWABYgNhAmIAYCS0N3UTigS04/NI5KXhYKQCtdAcba/snc2gE" +
                "72P1OtwEKt7n++bgnvr4BtURtOwYwIA8ZJyD+sNjYAT7W1v7VtLUBELmzAAAAAAEATgJrASsCpQADAAA" +
                "BIzUzASvd3QJrOgAAAAACAE4BpQFuAsUABwAPAAAAIiY0NjIWFCY0JiIGFBYyARp4VFR4VDI0VDQ0VAG" +
                "lVHhUVHgXSjk5SjkAAAABAE4A7QGOAiEADwAAJSE1MzUjNTM1MxUzFSMVMwGO/sCFhYU3hISE7TdCN4S" +
                "EN0IAAAAAAQAuAkwApALZAAkAABMjNzYzMhcWFAdaLDMLFRsGAgUCTHYXFwYOBgAAAAABACX/LgG8Af4" +
                "AGAAAJQciJwYjIicmJxUnETMRFhcWMzI1ETcRFgG8GxoSJUtMSw4COTkYLDItZzkDGyEfJSkIAfgJAr7" +
                "+dBgTFnEBWQz+RxwAAAABAE7/OQJ8Au4AFAAABSMRJxEjESMiJy4DJyY1NDYzIQJ8OEQ4yUMjEhsPCgI" +
                "DXF4BdMcDgQH8fwG8Gg4dMCQeLTJkfgAAAAABAEz/LgEkAAAAFQAAFzcWMzI1NCcmIgcHJzczBzYyFhQ" +
                "GIkwYJSFGFAkcFCIRPSooCT0vSlq/NRkqFgoEBw4cTjUGJ1MpAAACAAMAUAG/AccABgANAAAlJzcnNxc" +
                "VBSc3JzcXFQEEI5SWJbv+aSOUliW7UCKZlia7AbsimZYmuwEAAAACAE8AAAGxAsUAHQAlAAAlMxQGIyI" +
                "nJjU0Nz4DNzUzFRQOAgcGFRQWMjYCIiY0NjIWFAF5OF1VNCpSJRM2HRcBMxsgMwwhR2FHXxwTExwTsUt" +
                "mGjRePjYbNyBHNj9dLkknNREzLDVEPwIPExwTExwAAwAMAAACBQNqAAcACgAVAAAhIycjByMTMxMDAxM" +
                "jJyY1NDc2MzIXAgU8UOROO+A1SWRhbSxFBRYHBhUL9fUCvP5wATn+xwGxXAYHGwcCFwADAAwAAAIFA2g" +
                "ABwAKABQAACEjJyMHIxMzEwMDEyM3NjMyFxYUBwIFPFDkTjvgNUlkYXksMwsVGwYCBfX1Arz+cAE5/sc" +
                "Br3YXFwYOBgAAAAMADAAAAgUDkQAHAAoAEAAAISMnIwcjEzMTAwMTJwcnNxcCBTxQ5E474DVJZGHNaW0" +
                "mlI719QK8/nABOf7HAbFoaCeNjQAAAAMADAAAAgUDOgAHAAoAHAAAISMnIwcjEzMTAwMTMjcXBiMiJiY" +
                "jIgcnNjMyFhYCBTxQ5E474DVJZGGqJx8ZLTMSLTIZKSIZLzUSLTP19QK8/nABOf7HAeUjJzUTFyQnNRI" +
                "XAAAEAAwAAAIFAx0ABwAKABIAGgAAISMnIwcjEzMTAwMSIiY0NjIWFBYiJjQ2MhYUAgU8UOROO+A1SWR" +
                "hIRwTExwTiRwTExwT9fUCvP5wATn+xwGvExwTExwTExwTExwAAAADAAwAAAIFA3MADwASABoAACEjJyM" +
                "HIxMmJjQ2MhYUBgcTAwMSNCYiBhQWMgIFPFDkTjvUISlCXkIqIT1kYaYnOicnOvX1ApgMOlJDQ1I7C/6" +
                "UATn+xwG6OCgoOCgAAAACAE4AAAMLArwADwASAAAhITcjByMBIRUhFTMHIxEhJREDAwn+swG0gDsBbgF" +
                "P/uq/E6wBFP60mPX1Arw06zf+zPoBIv7eAAABAEL/LgGrAsYALgAAJRcGBwc2MhYUBiInNxYzMjU0JyY" +
                "iBwcnNyYmNRE0Njc2MzIXByYjIhURFBcWMzIBnwxSTyAJPS9KWjQYJSBHFQgcFCIRNkhXKywtPk1BEDk" +
                "znH8KCzxGLx8CKwYnUykTNRkqFgoEBw4cRghcWwFBTE4bGSEmFZP+uIMMAgAAAAIATgAAAZwDaQALABY" +
                "AACEhESEVIRUzByMRIQMjJyY1NDc2MzIXAZr+tAFO/uq/E6wBFI4sRQUWBwYVCwK8NOs3/swCqlwGBxs" +
                "HAhcAAAAAAgBOAAABnANnAAsAFQAAISERIRUhFTMHIxEhAyM3NjMyFxYUBwGa/rQBTv7qvxOsARSBLDM" +
                "LFRsHAQUCvDTrN/7MAqh2FxcGDgYAAAIATgAAAZwDkQALABEAACEhESEVIRUzByMRIQMnByc3FwGa/rQ" +
                "BTv7qvxOsARQ5aW0mlI4CvDTrN/7MAqtoaCeNjQAAAwBOAAABnAMdAAsAEwAbAAAhIREhFSEVMwcjESE" +
                "CIiY0NjIWFBYiJjQ2MhYUAZr+tAFO/uq/E6wBFOgcExMcE4kcExMcEwK8NOs3/swCqRMcExMcExMcExM" +
                "cAAACAE4AAADSA2kABQAQAAAzIxEnNTMnIycmNTQ3NjMyF9I4Q3sOLEUFFgcGFQsCiQIxIFwGBxsHAhc" +
                "AAAACAE4AAAEOA2cABQAPAAAzIxEnNTMnIzc2MzIXFhQHyThDewUsMwsVGwYCBQKJAjEedhcXBg4GAAI" +
                "ATgAAAXADkQAFAAsAACEjESc1MzcnByc3FwEHOEN7Q2ltJpSOAokCMSFoaCeNjQAAAAADAE4AAAEsAxs" +
                "ABQANABUAADMjESc1MyYiJjQ2MhYUFiImNDYyFhTiOEN7ZhoUFBoUiBoUFBoUAokCMR0THBMTHBMTHBM" +
                "THAADAE4AAAJdAr0ADwAVABsAACEjESM1MzUzMhYXMxUjERQnESERMzIDIxUhJiYBT9AxMbxdcxFBOjj" +
                "+zIispo4BLRBbAeM3o1hLN/7lyL4BJf5PAlhwODgAAgBOAAACOgM6AAkAGwAAISMBESMRMwERMycyNxc" +
                "GIyImJiMiByc2MzIWFgI6OP6EODgBfDitJx8ZLTMSLTIZKSIZLzUSLTMCVf2rArz9qwJVVSMnNRMXJCc" +
                "1EhcAAAAAAwA///UB4wNpAAsAFwAiAAABERQGIiY1ETQ2MhYDETQmIgYVERQWMjYDIycmNTQ3NjMyFwH" +
                "je6x9ccZtN1WMVFeHV4osRQUWBwYVCwH6/r9lX19lAUJnanD+XwFJSUpKSf62R0lHAmtcBgcbBwIXAAM" +
                "AP//1AeMDZwALABcAIQAAAREUBiImNRE0NjIWAxE0JiIGFREUFjI2AyM3NjMyFxYUBwHje6x9ccZtN1W" +
                "MVFeHV38sMwsVGwcBBQH6/r9lX19lAUJnanD+XwFJSUpKSf62R0lHAml2FxcGDgYAAAADAD//9QHjA5E" +
                "ACwAXAB0AAAERFAYiJjURNDYyFgMRNCYiBhURFBYyNgMnByc3FwHje6x9ccZtN1WMVFeHVyxpbSaUjgH" +
                "6/r9lX19lAUJnanD+XwFJSUpKSf62R0lHAmxoaCeNjQAAAAMAP//1AeMDOgALABcAKQAAAREUBiImNRE" +
                "0NjIWAxE0JiIGFREUFjI2AzI3FwYjIiYmIyIHJzYzMhYWAeN7rH1xxm03VYxUV4dXTicfGS0zEi0yGSk" +
                "iGS81Ei0zAfr+v2VfX2UBQmdqcP5fAUlJSkpJ/rZHSUcCoCMnNRMXJCc1EhcAAAQAP//1AeMDHQALABc" +
                "AHwAnAAABERQGIiY1ETQ2MhYDETQmIgYVERQWMjYCIiY0NjIWFBYiJjQ2MhYUAeN7rH1xxm03VYxUV4d" +
                "X3hoUFBoUiBoUFBoUAfr+v2VfX2UBQmdqcP5fAUlJSkpJ/rZHSUcCahMcExMcExMcExMcAAAAAQBOAKg" +
                "BagHxAAsAACUHJwcnNyc3FzcXBwFqKmRkKmpqKWVlKWvNJXp6JYCBI3p6I4EAAAMATv+OAfIDMQAVAB4" +
                "AJwAAFyM3JjURNDYzMhc3MwcWFREUBiMiJycTJiMiBhURFCURNCcDFjMyNqE9MkhxYzIrKTkyQ3tWMSc" +
                "gxCEsRlQBNSDBHydEV3KPNWcBQmdqEHWSN27+v2VfDlMCMg9KSf62P0ABST0l/dAMRwACAEr/+QHvA2k" +
                "AEwAeAAAlETMRFA4CIi4CNREzERQWMjYDIycmNTQ3NjMyFwG3OCU/RlBHPyU4WYJahSxFBRYHBhULsgI" +
                "L/f01TioUFCpONQID/fU9SkoCZ1wGBxsHAhcAAAAAAgBK//kB7wNoABMAHQAAJREzERQOAiIuAjURMxE" +
                "UFjI2AyM3NjMyFxYUBwG3OCU/RlBHPyU4WYJahSwzCxUbBgIFsgIL/f01TioUFCpONQID/fU9SkoCZnY" +
                "XFwYOBgAAAgBK//kB7wORABMAGQAAJREzERQOAiIuAjURMxEUFjI2AycHJzcXAbc4JT9GUEc/JThZglo" +
                "uaW0mlI6yAgv9/TVOKhQUKk41AgP99T1KSgJoaGgnjY0AAAMASv/5Ae8DHQATABsAIwAAJREzERQOAiI" +
                "uAjURMxEUFjI2AiImNDYyFhQWIiY0NjIWFAG3OCU/RlBHPyU4WYJa3RoUFBoUiBoUFBoUsgIL/f01Tio" +
                "UFCpONQID/fU9SkoCZhMcExMcExMcExMcAAACADz/+QH4A2gAFwAhAAAFJzY1NQYGIyImNTUzERQWMjY" +
                "3ETMRFAYDIzc2MzIXFhQHAY8NPRtaKWp7OGCIWAs5N48sMwsVGwYCBQclF2OOGBlpZ/f+/0ZJMjIBLP3" +
                "gSVMC23YXFwYOBgAAAAACAE4AAAHHArwADQAWAAAzIxEzFTYyFhQGIyImJzUUFjI2NCYiBoY4ODWrYWd" +
                "TJU4USnZJTWtOArz1Nmy0aSUgi01NSJZCQQABAE7/9QHdAr0AMgAAEjYyFhQHIwYWFhcWFxYVFAcGBwY" +
                "jIic3FjMyNzY1NCcmJyYnJjQ3Mjc2NCcmIyIVESMRTkWCQiUeERwtDysXQA4WOCQdWzkdKkBMGAwwJCN" +
                "AEgcRKQ0GDBMnUzkCZldTbCEdNSkNJRlERiIiMxQNMDApMhkZMjEkHjUqEzYeIw4jFSNq/eMCGQAAAAM" +
                "ATv/2Ac8CqQAYACYAMQAABSI1NTQ3NjMyFzQmIzcyFx4DFxYVEQY3ESYnJiMiBhUVFBcWMgMjJyY1NDc" +
                "2MzIXASnbRSQjdkdAWwNRJxUgEgwCA2gwU1YHBiY2SCpqPyxFBRYHBhULCrNTYyIRODdBKxMLFiQbFyM" +
                "m/tYKOAEBKAcBLzdXUxkPAfVcBgcbBwIXAAADAE7/9gHPAqcAGAAmADAAAAUiNTU0NzYzMhc0JiM3Mhc" +
                "eAxcWFREGNxEmJyYjIgYVFRQXFjIDIzc2MzIXFhQHASnbRSQjdkdAWwNRJxUgEgwCA2gwU1YHBiY2SCp" +
                "qMywzCxUbBgIFCrNTYyIRODdBKxMLFiQbFyMm/tYKOAEBKAcBLzdXUxkPAfN2FxcGDgYAAAAAAwBO//Y" +
                "BzwLQABgAJgAsAAAFIjU1NDc2MzIXNCYjNzIXHgMXFhURBjcRJicmIyIGFRUUFxYyEycHJzcXASnbRSQ" +
                "jdkdAWwNRJxUgEgwCA2gwU1YHBiY2SCpqIWltJpSOCrNTYyIRODdBKxMLFiQbFyMm/tYKOAEBKAcBLzd" +
                "XUxkPAfVoaCeNjQAAAAADAE7/9gHPAn4AGAAmADgAAAUiNTU0NzYzMhc0JiM3MhceAxcWFREGNxEmJyY" +
                "jIgYVFRQXFjIDMjcXBiMiJiYjIgcnNjMyFhYBKdtFJCN2R0BbA1EnFSASDAIDaDBTVgcGJjZIKmoLJx8" +
                "ZLTMSLTIZKSIZLzUSLTMKs1NjIhE4N0ErEwsWJBsXIyb+1go4AQEoBwEvN1dTGQ8CLiMnNRMXJCc1Ehc" +
                "AAAAEAE7/9gHPAl0AGAAmAC4ANgAABSI1NTQ3NjMyFzQmIzcyFx4DFxYVEQY3ESYnJiMiBhUVFBcWMgI" +
                "iJjQ2MhYUFiImNDYyFhQBKdtFJCN2R0BbA1EnFSASDAIDaDBTVgcGJjZIKmqJGhQUGhSIGhQUGhQKs1N" +
                "jIhE4N0ErEwsWJBsXIyb+1go4AQEoBwEvN1dTGQ8B9BMcExMcExMcExMcAAAAAAMATv/2Ac8CtAAeACw" +
                "ANAAAASMmJjQ2MhYUBxYXFhYXFhURBiMiNTU0NzYzMhc0JhMRJicmIyIGFRUUFxYyAjQmIgYUFjIBBQk" +
                "sPEJeQiE+GA0QAwRoPttFJCN2Rzw8U1YHBiY2SCpqGCc6Jyc6AdIEQVtCQl0hDyESHhkhMP7WCrNTYyI" +
                "RODVB/l4BASgHAS83V1MZDwH/OicnOicAAAADAE7/9AMAAf4AJAAyADwAACUyNxcGIyInFQYjIjU1NDc" +
                "2MzIXNCYjNzIXNjMyFhUVBRUUFxYnESYnJiMiBhUVFBcWMiU1NCYmIyIGFRUCP0VNFk5gQSloPttFJCN" +
                "2R0BbA4gtMmpTXf7QJx5+U1YHBiY2SCpqAWcuMhk3SCUpKy8bDwqzU2MiETg3QStFRllPghE9NhgTCQE" +
                "BKAcBLzdXUxkP31crNw88QFgAAQAk/y4BZgH+ADAAADcyNxcGIyInBzYyFhQGIic3FjMyNTQnJiIHByc" +
                "3JicmJjU1NDc2MzIXByYiBgYVFRT2LTcMQjcLCyEJPS9KWjQYJSBHFQgcFCIRORIKOzUcMG5CRBA5U0A" +
                "sJg0tEQErBidTKRM1GSoWCgQHDhxJAwQUU0uARzBTICkWFEY3kYMAAAAAAwBO//QBtgKpABMAHQAoAAA" +
                "3MjcXBiMiNTU0NjIWFRUFFRQXFjc1NCYmIyIGFRUTIycmNTQ3NjMyF/VFTRZNVK5lpl3+0Ccesy4yGTd" +
                "IlCxFBRYHBhULJSkrL5LNUVpZT4IRPTYYE+FXKzcPPEBYASJcBgcbBwIXAAAAAAMATv/0AbYCpwATAB0" +
                "AJwAANzI3FwYjIjU1NDYyFhUVBRUUFxY3NTQmJiMiBhUVEyM3NjMyFxYUB/VFTRZNVK5lpl3+0Ccesy4" +
                "yGTdIliwzCxUbBgIFJSkrL5LNUVpZT4IRPTYYE+FXKzcPPEBYASB2FxcGDgYAAAMATv/0AbYC0AATAB0" +
                "AIwAANzI3FwYjIjU1NDYyFhUVBRUUFxY3NTQmJiMiBhUVEycHJzcX9UVNFk1UrmWmXf7QJx6zLjIZN0j" +
                "3aW0mlI4lKSsvks1RWllPghE9NhgT4VcrNw88QFgBImhoJ42NAAAEACP/9AGLAl0AEwAdACUALQAANzI" +
                "3FwYjIjU1NDYyFhUVBRUUFxY3NTQmJiMiBhUVEiImNDYyFhQWIiY0NjIWFMpFTRZNVK5lpl3+0Ccesy4" +
                "yGTdIPRwTExwTiRwTExwTJSkrL5LNUVpZT4IRPTYYE+FXKzcPPEBYASETHBMTHBMTHBMTHAAAAgBOAAA" +
                "A1AKpAAoADgAAEyMnJjU0NzYzMhcTIxEzxCxFBRYHBhULQzg4AhxcBgcbBwIX/W4B9QACAE4AAADMAqc" +
                "ACQANAAATIzc2MzIXFhQHAyMRM4IsMwsVGwYCBUE4OAIadhcXBg4G/YoB9QAAAAL/3AAAAP4C0AAFAAk" +
                "AABMnByc3FwMjETPYaW0mlI5zODgCHGhoJ42N/b0B9QAAAAMATgAAASwCXQAHAA8AEwAAEiImNDYyFhQ" +
                "WIiY0NjIWFAMjETN8GhQUGhSIGhQUGhRSODgCGxMcExMcExMcExMc/dIB9QAAAAIATgAAAb8CfgASACQ" +
                "AABM2MzIXFhURIxE0JyYiBxEjETM3MjcXBiMiJiYjIgcnNjMyFhaCM1w0JVU3HCKHPTg4xScfGS0zEi0" +
                "yGSkiGS81Ei0zAdMrEydq/qYBVzQdIyL+VwH1YCMnNRMXJCc1EhcAAAAAAwBO//YBwwKpAAsAFgAhAAA" +
                "BFRQGIiY1NTQ2MhYHNTQjIhUVFBYyNgMjJyY1NDc2MzIXAcNcul9hsmI4gYRHe0NyLEUFFgcGFQsBPIR" +
                "Ubm9ThF9laemOkZGOPEpJAatcBgcbBwIXAAADAE7/9gHDAqcACwAWACAAAAEVFAYiJjU1NDYyFgc1NCM" +
                "iFRUUFjI2AyM3NjMyFxYUBwHDXLpfYbJiOIGER3tDcCwzCxUbBwEFATyEVG5vU4RfZWnpjpGRjjxKSQG" +
                "pdhcXBg4GAAAAAAMATv/2AcMC0AALABYAHAAAARUUBiImNTU0NjIWBzU0IyIVFRQWMjYDJwcnNxcBw1y" +
                "6X2GyYjiBhEd7QxRpbSaUjgE8hFRub1OEX2Vp6Y6RkY48SkkBq2hoJ42NAAAAAAMATv/2AcMCfgALABY" +
                "AKAAAARUUBiImNTU0NjIWBzU0IyIVFRQWMjYDMjcXBiMiJiYjIgcnNjMyFhYBw1y6X2GyYjiBhEd7Qzc" +
                "nHxktMxItMhkpIhkvNRItMwE8hFRub1OEX2Vp6Y6RkY48SkkB5CMnNRMXJCc1EhcAAAAEAE7/9gHDAl0" +
                "ACwAWAB4AJgAAARUUBiImNTU0NjIWBzU0IyIVFRQWMjYCIiY0NjIWFBYiJjQ2MhYUAcNcul9hsmI4gYR" +
                "He0O9HBMTHBOJHBMTHBMBPIRUbm9ThF9laemOkZGOPEpJAaoTHBMTHBMTHBMTHAAAAAADAE4A3gGOAiE" +
                "AAwALABMAAAEhNSEmIiY0NjIWFAIiJjQ2MhYUAY7+wAFAkBwTExwTExwTExwTAWY3QhMcExMc/uwUGhQ" +
                "UGgADAE7/vQHDAkwAFQAeACYAABcjNyY1NTQ2MzIXNzMHFhUVFAYjIic3NTQnAxYzMjYHEyYjIhUVFJs" +
                "5Kj5hWyckJjsyP1xdLCTRHp8bIT5D6J0YHoRDYjVkhF9lDVl0NmaEVG4Oqo5EJP6PC0kdAXAJkY43AAI" +
                "ATv/1AcMCqQARABwAACEjNwYGIyI1ETMRFBYzMjURMycjJyY1NDc2MzIXAcM3BBhJJbw4Rz2BOKMsRQU" +
                "WBwYVCzMeILcBSf6wQD5+AVAnXAYHGwcCFwACAE7/9QHDAqcAEQAbAAAhIzcGBiMiNREzERQWMzI1ETM" +
                "nIzc2MzIXFhQHAcM3BBhJJbw4Rz2BOKgsMwsVGwcBBTMeILcBSf6wQD5+AVAldhcXBg4GAAAAAgBO//U" +
                "BwwLQABEAFwAAISM3BgYjIjURMxEUFjMyNREzJycHJzcXAcM3BBhJJbw4Rz2BOE5pbSaUjjMeILcBSf6" +
                "wQD5+AVAnaGgnjY0AAAADAE7/9QHDAl0AEQAZACEAACEjNwYGIyI1ETMRFBYzMjURMyYiJjQ2MhYUFiI" +
                "mNDYyFhQBwzcEGEklvDhHPYE4+xoUFBoUiBoUFBoUMx4gtwFJ/rBAPn4BUCYTHBMTHBMTHBMTHAAAAAI" +
                "ATv8uAecCpwAbACUAAAUnNjU1BiMiNREzERQWMjY1NTQ3NjcXBhURFAYDIzc2MzIXFhQHAVwPQyVfvjZ" +
                "GeUwKES4PIjB9LDMLFRsGAgXSKxlPcD28AUX+sUA/PkHFSRgjDyYPN/4xPUYC2nYXFwYOBgAAAgBOAAA" +
                "BxwJMAA0AFgAAMyMRMxU2MhYUBiMiJic1FBYyNjQmIgaGODg1q2FnUyVOFEp2SU1rTgJMhTZstGklIIt" +
                "NTUiWQkEAAwBO/y4B5wJdABsAIwArAAAFJzY1NQYjIjURMxEUFjI2NTU0NzY3FwYVERQGAiImNDYyFhQ" +
                "WIiY0NjIWFAFcD0MlX742RnlMChEuDyIwxxoUFBoUiBoUFBoU0isZT3A9vAFF/rFAPz5BxUkYIw8mDzf" +
                "+MT1GAtsTHBMTHBMTHBMTHAAAAwAMAAACBQMUAAcACgAOAAAhIycjByMTMxMDAxMjNTMCBTxQ5E474DV" +
                "JZGHL2dn19QK8/nABOf7HAa46AAAAAAMATv/2Ac8CVAAYACYAKgAABSI1NTQ3NjMyFzQmIzcyFx4DFxY" +
                "VEQY3ESYnJiMiBhUVFBcWMhMjNTMBKdtFJCN2R0BbA1EnFSASDAIDaDBTVgcGJjZIKmoh2dkKs1NjIhE" +
                "4N0ErEwsWJBsXIyb+1go4AQEoBwEvN1dTGQ8B8zoAAwAMAAACBQNQAAcACgAaAAAhIycjByMTMxMDAxM" +
                "VFAYiJjU1MxUUFjI2NTUCBTxQ5E474DVJZGHVQl5CLSc6J/X1Arz+cAE5/scCJAUvQkIvBQUdJycdBQA" +
                "AAAADAE7/9gHPApAAGAAmADYAAAUiNTU0NzYzMhc0JiM3MhceAxcWFREGNxEmJyYjIgYVFRQXFjITFRQ" +
                "GIiY1NTMVFBYyNjU1ASnbRSQjdkdAWwNRJxUgEgwCA2gwU1YHBiY2SCpqRUJeQi0nOicKs1NjIhE4N0E" +
                "rEwsWJBsXIyb+1go4AQEoBwEvN1dTGQ8CaQUvQkIvBQUdJycdBQACAE7/KwJpArwAGAAbAAAhBhUUFjI" +
                "2NxcGIyImJjU0NyMnIwcjEzMTCwICRmgTKhsOJSBBESQnYAFQ5E474DXkm2RhVygPGBMWJjIJKCFEP/X" +
                "1Arz9RAEsATn+xwAAAAACACX/KwHIAf0AKwA5AAAhBhUUFjI2NxcGIyImJjU0NwYiLgI1NTQ3NjMyFzQ" +
                "mIzcyFx4DFxYVEScRJicmIyIGFRUUFxYyAaVoEyobDiUgQREkJ1ZiK0s/JUUkI3ZHQFsDUScVIBIMAgM" +
                "4U1cGBiY2SCpqVygPGBMWJjIJKCFBPAQRI0o1U2MiETg3QSsTCxYkGxcjJv7WLgEBKAcBLzdXUxkPAAI" +
                "AQv/2AasDawAbACUAACUGIyIuAjURNDY3NjMyFwcmIyIVERQXFjMyNwMjNzYzMhcWFAcBq1VNEEFJLSs" +
                "sLT5NQRA5M5x/Cgs8VYksMwsVGwYCBRchBidVPwFBTE4bGSEmFZP+uIMMAh4CmHYXFwYOBgAAAgBO//U" +
                "BkAKnABcAIQAAJTI3FwYiJyY1NTQ3NjMyFwcmIgYGFRUUEyM3NjMyFxYUBwEgLTcMQGgyaBwwbkJEEDl" +
                "TQCx3LDMLFRsHAQUmDS0RECKNgEcwUyApFhRGN5GDAfR2FxcGDgYAAAAAAgBC//YBqwORAAUAIQAAASc" +
                "HJzcXEwYjIi4CNRE0Njc2MzIXByYjIhURFBcWMzI3AX9pbSaUjgZVTRBBSS0rLC0+TUEQOTOcfwoLPFU" +
                "C3WhoJ42N/RMhBidVPwFBTE4bGSEmFZP+uIMMAh4AAgBO//UBkQLRABcAHQAAJTI3FwYiJyY1NTQ3NjM" +
                "yFwcmIgYGFRUUEycHJzcXASAtNwxAaDJoHDBuQkQQOVNALOVpbSaUjiYNLREQIo2ARzBTICkWFEY3kYM" +
                "B92hoJ42NAAAAAAIAQv/2AasDHQAbACMAACUGIyIuAjURNDY3NjMyFwcmIyIVERQXFjMyNwIGIiY0NjI" +
                "WAatVTRBBSS0rLC0+TUEQOTOcfwoLPFV0FBsUFBwTFyEGJ1U/AUFMThsZISYVk/64gwwCHgKoFBQbFBM" +
                "AAAACAE7/9QGQAl0AFwAfAAAlMjcXBiInJjU1NDc2MzIXByYiBgYVFRQSIiY0NjIWFAEgLTcMQGgyaBw" +
                "wbkJEEDlTQCyQGhUUGxQmDS0RECKNgEcwUyApFhRGN5GDAfQUGxQTHAAAAgBC//YBqwORABsAIQAAJQY" +
                "jIi4CNRE0Njc2MzIXByYjIhURFBcWMzI3AwcnNxc3AatVTRBBSS0rLC0+TUEQOTOcfwoLPFURjpQmbWk" +
                "XIQYnVT8BQUxOGxkhJhWT/riDDAIeAySNjSdoaAAAAgBO//UBkQLTABcAHQAAJTI3FwYiJyY1NTQ3NjM" +
                "yFwcmIgYGFRUUAQcnNxc3ASAtNwxAaDJoHDBuQkQQOVNALAELjpQmbWkmDS0RECKNgEcwUyApFhRGN5G" +
                "DAoaNjSdoaAAAAAMATgAAAfIDkgAIABEAFwAAISMRMzIWFREUJxE0JiMjETMyAwcnNxc3AR7QvHF3OGR" +
                "CjoisGo6UJm1pAr18Z/7uyL4BJlRS/agDOY2NJ2hoAAAAAAMATv/0AkACxgAOABkAJwAAATIXNTMRBiI" +
                "nJjU1NDc2FyYjIgYVFRQzMjcTJzY3NycmNjYyFhYVFAEDUzE4VpI7TlUpuz1IPz6dLTh5KC0NBQoSARM" +
                "ODhUB/SPi/UQMHihjvWknE1QiQDS7dQkCABwaFAcDDSQRARcPOgADAE4AAAHyAxQACAARABUAACEjETM" +
                "yFhURFCcRNCYjIxEzMgMjNTMBHtC8cXc4ZEKOiKwy2dkCvXxn/u7IvgEmVFL9qAKoOgACAE7/9AH9Arw" +
                "AFgAhAAABMhc1IzUzNTMVMxUjEQYiJyY1NTQ3NhcmIyIGFRUUMzI3AQNTMXR0OD4+VpI7TlUpuz1IPz6" +
                "dLTgB/SNYN1NTN/3ODB4oY71pJxNUIkA0u3UJAAAAAgBOAAABnAMUAAsADwAAISERIRUhFTMHIxEhAyM" +
                "1MwGa/rQBTv7qvxOsARQ62dkCvDTrN/7MAqg6AAAAAwAj//QBiwJUABMAHQAhAAA3MjcXBiMiNTU0NjI" +
                "WFRUFFRQXFjc1NCYmIyIGFRUTIzUzykVNFk1UrmWmXf7QJx6zLjIZN0jr2dklKSsvks1RWllPghE9Nhg" +
                "T4VcrNw88QFgBIDoAAAACAE4AAAGcAx0ACwATAAAhIREhFSEVMwcjESECBiImNDYyFgGa/rQBTv7qvxO" +
                "sARR5FBsUFBwTArw06zf+zAK8FBQbFBMAAAADAE7/9AG2Al0AEwAdACUAADcyNxcGIyI1NTQ2MhYVFQU" +
                "VFBcWNzU0JiYjIgYVFRIGIiY0NjIW9UVNFk1UrmWmXf7QJx6zLjIZN0ipFBsUFBwTJSkrL5LNUVpZT4I" +
                "RPTYYE+FXKzcPPEBYATQUFBsUEwAAAAEATv8rAbwCvAAcAAAhBhUUFjI2NxcGIyImJjU0NyERIRUhFTM" +
                "HIxEhFQGZaBMqGw4lIEERJCdg/u8BTv7qvxOsARRXKA8YExYmMgkoIUQ/Arw06zf+zDIAAAAAAgAj/ys" +
                "BiwH+ACQALgAANzI3FwYHBhUUFjI2NxcGIyImJjU0NyImNTU0NjIWFRUFFRQXFjc1NCYmIyIGFRXKRU0" +
                "WMDlhEyobDiUgQREkJ05KV2WmXf7QJx6zLjIZN0glKSseClMnDxgTFiYyCSghPjlJSc1RWllPghE9Nhg" +
                "T4VcrNw88QFgAAAIATgAAAZwDkgALABEAACEhESEVIRUzByMRIQMHJzcXNwGa/rQBTv7qvxOsARQTjpQ" +
                "mbWkCvDTrN/7MAzmNjSdoaAAAAwBO//QBtgLSABMAHQAjAAA3MjcXBiMiNTU0NjIWFRUFFRQXFjc1NCY" +
                "mIyIGFRUBByc3Fzf1RU0WTVSuZaZd/tAnHrMuMhk3SAERjpQmbWklKSsvks1RWllPghE9NhgT4VcrNw8" +
                "8QFgBsY2NJ2hoAAIAQf/2AdwDkQAcACIAACEjJwYiJjURNDc2MzIXByYjIhURFBYyNjU1IyczAycHJzc" +
                "XAdwpDjS1e1ctPk1BEDkznFeHUEITilhpbSaUjikzZGMBOoA1GSEmFZP+u0NMTkA7NwGxaGgnjY0AAAM" +
                "ATv8uAcgC0QAFABgAJAAAAScHJzcXAyc2NTUGIiY1NTQ2MhcnMxEUBgM1NCYiBhUVFBYyNgGiaW0mlI5" +
                "sD0IqtWJntCoEODIGUGxNR3NPAh1oaCeNjfzqKxlPfElgXJVYYUM6/cs8RAFtoz49QUqZP0BFAAAAAAI" +
                "AQf/2AdwDTgAcACwAACEjJwYiJjURNDc2MzIXByYjIhURFBYyNjU1IyczAxUUBiImNTUzFRQWMjY1NQH" +
                "cKQ40tXtXLT5NQRA5M5xXh1BCE4pXQ1xDLSg4KCkzZGMBOoA1GSEmFZP+u0NMTkA7NwIiBS9CQi8FBR0" +
                "nJx0FAAAAAwBO/y4BxwKKAA8AIgAuAAABFRQGIiY1NTMVFBYyNjU1Ayc2NTUGIiY1NTQ2MhcnMxEUBgM" +
                "1NCYiBhUVFBYyNgGLQ1xDLSg4KAIPQiq1Yme0KgQ4MgZQbE1Hc08CigUvQkIvBQUdJycdBfykKxlPfEl" +
                "gXJVYYUM6/cs8RAFtoz49QUqZP0BFAAIAQf/2AdwDHAAHACQAAAAiJjQ2MhYUEyMnBiImNRE0NzYzMhc" +
                "HJiMiFREUFjI2NTUjJzMBHhoVFBsUqikONLV7Vy0+TUEQOTOcV4dQQhOKAtkVGhQUG/0TKTNkYwE6gDU" +
                "ZISYVk/67Q0xOQDs3AAADAE7/LgHHAlwABwAaACYAAAAGIiY0NjIWEyc2NTUGIiY1NTQ2MhcnMxEUBgM" +
                "1NCYiBhUVFBYyNgE5FBsUFBwTIw9CKrViZ7QqBDgyBlBsTUdzTwItFBUaFBT85isZT3xJYFyVWGFDOv3" +
                "LPEQBbaM+PUFKmT9ARQACAEH/SAHcAsUAHAAqAAAhIycGIiY1ETQ3NjMyFwcmIyIVERQWMjY1NSMnMwM" +
                "nNjc3JyY2NjIWFhUUAdwpDjS1e1ctPk1BEDkznFeHUEITiusoLQ0FChIBEw4OFSkzZGMBOoA1GSEmFZP" +
                "+u0NMTkA7N/4cHBoUBwMNJBEBFw86AAMATv8uAccCswASAB4ALAAABSc2NTUGIiY1NTQ2MhcnMxEUBgM" +
                "1NCYiBhUVFBYyNgMXFgYGIiYmNTQ3FwYHAVwPQiq1Yme0KgQ4MgZQbE1Hc0+BChIBEw4OFUAoKhDSKxl" +
                "PfElgXJVYYUM6/cs8RAFtoz49QUqZP0BFAfUDDSQRARcPOjUcGBYAAAAAAgBOAAAB/AORAAsAEQAAISM" +
                "RIREjETMRIREzJycHJzcXAfw4/sI4OAE+OE1pbSaUjgFm/poCvP7hAR8haGgnjY0AAAACAEAAAAImA5E" +
                "ABQAYAAABJwcnNxcDNjMyFxYVESMRNCcmIgcRIxEzATxpbSaUjnUyVTYnVTccIoc9ODgC3WhoJ42N/tY" +
                "kEydq/qYBVzQdIyL+VwK8AAAAAgBOAAACXQK8ABMAFwAAISMRIREjESM1MzUzFSE1MxUzFSMHNSEVAi0" +
                "4/sI4MTE4AT44MDA4/sIBZv6aAeM3oqKiojdGRkYAAQBOAAAB/QK8ABoAABM2MzIXFhURIxE0JyYiBxE" +
                "jESM1MzUzFTMVI8QyVTYnVTccIoc9OD4+OHR0AdokEydq/qYBVzQdIyL+VwIyN1NTNwACAE4AAAGcAzs" +
                "ABQAXAAAhIxEnNTM3MjcXBiMiJiYjIgcnNjMyFhYBHjhDex8nHxktMxItMhkpIhkvNRItMwKJAjFWIyc" +
                "1ExckJzUSFwAAAAIATgAAAZwCdAARABUAAAEyNxcGIyImJiMiByc2MzIWFgMjETMBPScfGS0zEi0yGSk" +
                "iGS81Ei0zGTg4AksjJzUTFyQnNRIX/bUB9QACAE4AAAEmAxQABQAJAAAzIxEnNTM3IzUz9ThDezHY2AK" +
                "JAjEeOgAAAgBOAAABJwJUAAMABwAAASM1MwMjETMBJ9nZTTg4Aho6/awB9QAAAAEATv8rAQsCvAAVAAA" +
                "zBhUUFjI2NxcGIyImJjU0NzMRJzUz6GgTKhsOJSBBESQnYAJDe1coDxgTFiYyCSghRD8CiQIxAAAAAAL" +
                "/+f8rALYCxgAUABwAADMGFRQWMjY3FwYjIiYmNTQ3MxEzEQIiJjQ2MhYUk2gTKhsOJSBBESQnYAM4Dho" +
                "VFBsUVygPGBMWJjIJKCFEPwH1/gsCgxUaFBQbAAAAAgBOAAAAzwMdAAUADQAAMyMRJzUzNgYiJjQ2Mhb" +
                "JOEN7BhQbFBQcEwKJAjEyFBQbFBMAAAEAJAAAAFwB9QADAAAzIxEzXDg4AfUAAAL//P/bAN4DTgALABs" +
                "AABcnMjY1ESc1MxEUBhMVFAYiJjU1MxUUFjI2NTURDSExQ3xDkkJeQi0nOiclJTY8AhcCMf26SlEDcwU" +
                "vQkIvBQUdJycdBQAAAAACAE7/LwFwAtEABQATAAABJwcnNxcDEScnMxEGBiMnMjY3NgFKaW0mlI6uLRd" +
                "8AkQ2BwcgChoCHWhoJ42N/YQB9gM0/cA6TCsQCx0AAgBP/0gB3AK9AAsAGQAAISMDBxEjETMREzMDEyc" +
                "2NzcnJjY2MhYWFRQB3EPiMDg44EHNCygtDQUKEgETDg4VAVlM/vMCvf6yAU7+0f26HBoUBwMNJBEBFw8" +
                "6AAACAEP/SAGyArwADAAaAAAhIwMHESMRMxE3FwcWAyc2NzcnJjY2MhYWFRQBskPANDg4yCiURE0oLQ0" +
                "FChIBEw4OFQE9Lf7wArz+k7kngXH+WRwaFAcDDSQRARcPOgAAAAABAE7//wHAAgAAEQAAJRciJiYnJwc" +
                "VIxEXFTczBxcWAb4CIzwfHGk3ODjQSrx/My8wJSQmkDjGAgAN4ePNs0QAAgBOAAABtwNnAAUADwAAISE" +
                "RMxEhAyM3NjMyFxYUBwG3/pc4ATH+LDMLFRsHAQUCvP12Aqh2FxcGDgYAAgBOAAAAzgNrAAMADQAAMyM" +
                "RMycjNzYzMhcWFAeGODgCLDMLFRsGAgUCvCJ2FxcGDgYAAAIATv9IAbcCvAAFABMAACEhETMRIQcnNjc" +
                "3JyY2NjIWFhUUAbf+lzgBMcYoLQ0FChIBEw4OFQK8/XbqHBoUBwMNJBEBFw86AAIATv9IALYCvAADABE" +
                "AADMjETMDJzY3NycmNjYyFhYVFK84ODkoLQ0FChIBEw4OFQK8/IwcGhQHAw0kEQEXDzoAAAAAAgBOAAA" +
                "CKgOSAAUACwAAISERMxEhAwcnNxc3Air+lzgBMbqOlCZtaQK8/XYDOY2NJ2hoAAIATgAAAXADkgADAAk" +
                "AADMjETM3Byc3Fzf6ODh2jpQmbWkCvK+NjSdoaAAAAQBOAAACMgK8AA0AACEhEQcnNxEzETcXBxEhAjL" +
                "+l2UWezhwF4cBMQFhLTI3AR/++jMyPf64AAABAE4AAAGIArwADQAAISMRByc3NSc1MxE3FwcBDjhyFoh" +
                "De2MXegFnMzI95gIx/wAtMjcAAgBOAAACOgNnAAkAEwAAISMBESMRMwERMycjNzYzMhcWFAcCOjj+hDg" +
                "4AXw4+CwzCxUbBgIFAlX9qwK8/asCVR52FxcGDgYAAgBOAAABvwKnABIAHAAAEzYzMhcWFREjETQnJiI" +
                "HESMRMzcjNzYzMhcWFAeCM1w0JVU3HCKHPTg4jSwzCxUbBwEFAdMrEydq/qYBVzQdIyL+VwH1JXYXFwY" +
                "OBgACAE7/SAI6ArwACQAXAAAhIwERIxEzAREzASc2NzcnJjY2MhYWFRQCOjj+hDg4AXw4/wAoLQ0FChI" +
                "BEw4OFQJV/asCvP2rAlX8jBwaFAcDDSQRARcPOgAAAgBA/0gBsQH+ABIAIAAAEzYzMhcWFREjETQnJiI" +
                "HESMRMxMnNjc3JyY2NjIWFhUUdDNcNCVVNxwihz04OGIoLQ0FChIBEw4OFQHTKxMnav6mAVc0HSMi/lc" +
                "B9f1THBoUBwMNJBEBFw86AAAAAgBOAAACOgOSAAkADwAAISMBESMRMwERMycHJzcXNwI6OP6EODgBfDh" +
                "gjpQmbWkCVf2rArz9qwJVr42NJ2hoAAIATgAAAb8DBAASABgAABM2MzIXFhURIxE0JyYiBxEjETMlByc" +
                "3FzeCM1w0JVU3HCKHPTg4AR+OlCZtaQHTKxMnav6mAVc0HSMi/lcB9eiNjSdoaAAAAAABAE7/2wI7Arw" +
                "AFQAAJREnNTMRFAYjJiYnMjcmAicRIxEzAAIBQ31DOwIJAigVPO88ODgBZWkCIAIx/bpKUQYZBiFeAXh" +
                "e/asCvP3ZAAAAAAEAQP8vAbEB/gAaAAATNjMyFxYVEQYGIycyNjc2NRE0JyYiBxEjETN0M1w0JVUCRDY" +
                "HByEKGhwihz04OAHTKxMnav5bOkwrEAsdNgGPNB0jIv5XAfUAAAADAD//9QHjAxQACwAXABsAAAERFAY" +
                "iJjURNDYyFgMRNCYiBhURFBYyNgMjNTMB43usfXHGbTdVjFRXh1cz2dkB+v6/ZV9fZQFCZ2pw/l8BSUl" +
                "KSkn+tkdJRwJpOgAAAAADAE7/9gHDAlQACwAWABoAAAEVFAYiJjU1NDYyFgc1NCMiFRUUFjI2AyM1MwH" +
                "DXLpfYbJiOIGER3tDF9jYATyEVG5vU4RfZWnpjpGRjjxKSQGpOgAEAD//9QHjA2gACwAXACEAKwAAARE" +
                "UBiImNRE0NjIWAxE0JiIGFREUFjI2AyM3NjMyFxYUBwcjNzYzMhcWFAcB43usfXHGbTdVjFRXh1dTLDM" +
                "LFRsHAQW1LDMLFRsHAQUB+v6/ZV9fZQFCZ2pw/l8BSUlKSkn+tkdJRwJqdhcXBg4GXHYXFwYOBgAAAAQ" +
                "ATv/2AcMCrAALABYAIAAqAAABFRQGIiY1NTQ2MhYHNTQjIhUVFBYyNgMjNzYzMhcWFAcHIzc2MzIXFhQ" +
                "HAcNcul9hsmI4gYRHe0M/LDMLFRsGAgW1LDMLFRsGAgUBPIRUbm9ThF9laemOkZGOPEpJAa52FxcGDgZ" +
                "cdhcXBg4GAAAAAAIATv/1AwcCzAAaACYAACUHFSEVITUGIiY1ETQ2Mhc1IRUhFRYVFTMHIwcRJiYiBhU" +
                "RFBYyNgHyAQEU/rQ5tX1xxDYBTv7qAb4TqzkJUYVUV39UuRZxMigzX2UBQmdqNiY0cgkTXTfJAYM7PEp" +
                "J/rZHSTkAAwBO//QC9AIAABsAJgAwAAAlMjcXBiInBiImNTU0NjMyFzYzMhYVFQUVFBcWJzU0IyIVFRQ" +
                "WMjYlNTQmJiMiBhUVAjNFTRZNySc0vV9hW2kyMG9TXf7QJx5+gYRHe0MBMS4yGTdIJSkrL0hGb1OEX2V" +
                "RT1lPghE9NhgTiY6RkY48SkmVVys3DzxAWAADAE4AAAIBA2cAEAAcACYAACEjJwYjIxUjETMyFhUUBgY" +
                "HJTMyNjY3NjU0JiMjNyM3NjMyFxYUBwIBOVUSFsU49l9dByon/t7GJDIYBghFO8KJLDMLFRsHAQX4A/U" +
                "CvHRiL0JXFSMdJB8jN1FQU3YXFwYOBgAAAAACAE4AAAFIAqcADQAXAAABJiIGFREjETMHNjMyFycjNzY" +
                "zMhcWFAcBOSZOPzg4Ay9NIieSLDMLFRsGAgUBwgojIf54AfUjKwgldhcXBg4GAAMATv9IAgECvAAQABw" +
                "AKgAAISMnBiMjFSMRMzIWFRQGBgclMzI2Njc2NTQmIyMTJzY3NycmNjYyFhYVFAIBOVUSFsU49l9dByo" +
                "n/t7GJDIYBghFO8J1KC0NBQoSARMODhX4A/UCvHRiL0JXFSMdJB8jN1FQ/MEcGhQHAw0kEQEXDzoAAAI" +
                "APf9IATcB/QANABsAAAEmIgYVESMRMwc2MzIXAyc2NzcnJjY2MhYWFRQBKCZOPzg4Ay9NIifIKC0NBQo" +
                "SARMODhUBwgojIf54AfUjKwj9UxwaFAcDDSQRARcPOgAAAAMATgAAAgEDkgAQABwAIgAAISMnBiMjFSM" +
                "RMzIWFRQGBgclMzI2Njc2NTQmIyMlByc3FzcCATlVEhbFOPZfXQcqJ/7exiQyGAYIRTvCASWOlCZtafg" +
                "D9QK8dGIvQlcVIx0kHyM3UVDkjY0naGgAAAACAE4AAAFwAwQADQATAAABJiIGFREjETMHNjMyFzcHJzc" +
                "XNwE6Jk4/ODgDL00iJyeOlCZtaQHCCiMh/ngB9SMrCOiNjSdoaAACACX/9QIAA2wAJAAuAAA3MxYWMjY" +
                "1NC4ENTQ2MzIXFAcmIgYVFBceBBUUBiImEyM3NjMyFxYUByU5BWGYaDtYZ1g7dG1TPxE5k1xPI1VWRix" +
                "15331LDMLFRsGAgWyNVJFSy5BIicmTDVGZh4CMx1AOUAkEBwiK0owXG9zAnd2FxcGDgYAAAAAAgBO//E" +
                "BtgKnACAAKgAANzMWFjI2NC4CJyY0NjMyFhcXByYiBhUUHgMUBiImEyM3NjMyFxYUB041Bk5dSjlSVCA" +
                "mUVsgOAwMEyRsQUJVVDpZq2K8LDMLFRsGAgV/LS0pUy4aHR0iZVcPBwcuGi4nJisZIEJuUFIB13YXFwY" +
                "OBgACACX/9QIAA5EAJAAqAAA3MxYWMjY1NC4ENTQ2MzIXFAcmIgYVFBceBBUUBiImAScHJzcXJTkFYZh" +
                "oO1hnWDt0bVM/ETmTXE8jVVZGLHXnfQFSaW0mlI6yNVJFSy5BIicmTDVGZh4CMx1AOUAkEBwiK0owXG9" +
                "zAnVoaCeNjQAAAAIATv/xAbYC0QAFACYAAAEnByc3FwEzFhYyNjQuAicmNDYzMhYXFwcmIgYVFB4DFAY" +
                "iJgFzaW0mlI7+tTUGTl1KOVJUICZRWyA4DAwTJGxBQlVUOlmrYgIdaGgnjY3+Oy0tKVMuGh0dImVXDwc" +
                "HLhouJyYrGSBCblBSAAABACT/LgGMAgEANgAAFzcWMzI1NCcmIgcHJzcmJiczFhYyNjQuAicmNDYzMhY" +
                "XFwcmIgYVFB4DFAYHBzYyFhQGIm4YJSFGFAkcFCIRMkpUAjUGTl1KOVJUICZRWyA4DAwTJGxBQlVUOlB" +
                "OHQk9L0pavzUZKhYKBAcOHEAGUDctLSlTLhodHSJlVw8HBy4aLicmKxkgQmtOBCcGJ1MpAAAAAgAl//U" +
                "CAAPEACQAKgAANzMWFjI2NTQuBDU0NjMyFxQHJiIGFRQXHgQVFAYiJgEHJzcXNyU5BWGYaDtYZ1g7dG1" +
                "TPxE5k1xPI1VWRix1530BlY6UJm1psjVSRUsuQSInJkw1RmYeAjMdQDlAJBAcIitKMFxvcwM1jY0naGg" +
                "AAAACAE7/8QG2AwMAIAAmAAA3MxYWMjY0LgInJjQ2MzIWFxcHJiIGFRQeAxQGIiYBByc3FzdONQZOXUo" +
                "5UlQgJlFbIDgMDBMkbEFCVVQ6WatiAUWOlCZtaX8tLSlTLhodHSJlVw8HBy4aLicmKxkgQm5QUgKZjY0" +
                "naGgAAAAAAgAA/0gBkgK8AAcAFQAAMyMRIzUhFSMDJzY3NycmNjYyFhYVFOI4qgGSsDcoLQ0FChIBEw4" +
                "OFQKKMjL8vhwaFAcDDSQRARcPOgAAAAIALP9IAPACvAAMABoAADcHJiY1ETMVMwcjERQHJzY3NycmNjY" +
                "yFhYVFLoQODI4eBhgJCgtDQUKEgETDg4VHisQRjsCOMc1/sRQ7BwaFAcDDSQRARcPOgACAAAAAAGSA5I" +
                "ABwANAAAzIxEjNSEVIzcHJzcXN+I4qgGSsHaOlCZtaQKKMjLhjY0naGgAAgAs//MBTgOSAAwAEgAANwc" +
                "mJjURMxUzByMRFBMHJzcXN+IQODI4eBhgro6UJm1pHisQRjsCOMc1/sRQAzeNjSdoaAACAAAAAAGSAxQ" +
                "ABwALAAAzIxEjNSEVIzcjNTPiOKoBkrBR2dkCijIyUDoAAAEATv/zAUQCvAAUAAAlByYmNTUjNTMRMxU" +
                "zByMVMxUjFRQBDhA4MkZGOHgYYGxsHisQRjurNwFWxzVaN6tQAAACAEr/+QHvAzsAEwAlAAAlETMRFA4" +
                "CIi4CNREzERQWMjYDMjcXBiMiJiYjIgcnNjMyFhYBtzglP0ZQRz8lOFmCWlAnHxktMxItMhkpIhkvNRI" +
                "tM7ICC/39NU4qFBQqTjUCA/31PUpKAp0jJzUTFyQnNRIXAAIATv/1AcMCfgARACMAACEjNwYGIyI1ETM" +
                "RFBYzMjURMycyNxcGIyImJiMiByc2MzIWFgHDNwQYSSW8OEc9gThzJx8ZLTMSLTIZKSIZLzUSLTMzHiC" +
                "3AUn+sEA+fgFQYCMnNRMXJCc1EhcAAAIASv/5Ae8DFAATABcAACURMxEUDgIiLgI1ETMRFBYyNgMjNTM" +
                "BtzglP0ZQRz8lOFmCWjDZ2bICC/39NU4qFBQqTjUCA/31PUpKAmU6AAAAAgBO//UBwwJUABEAFQAAISM" +
                "3BgYjIjURMxEUFjMyNREzJyM1MwHDNwQYSSW8OEc9gThT2dkzHiC3AUn+sEA+fgFQJToAAAAAAgBK//k" +
                "B7wNKABMAIwAAJREzERQOAiIuAjURMxEUFjI2AxUUBiImNTUzFRQWMjY1NQG3OCU/RlBHPyU4WYJaKkN" +
                "cQy0oOCiyAgv9/TVOKhQUKk41AgP99T1KSgLVBS9CQi8FBR0nJx0FAAAAAgBO//UBwwKNAA8AIQAAARU" +
                "UBiImNTUzFRQWMjY1NRMjNwYGIyI1ETMRFBYzMjURMwF/Q1xDLSg4KHE3BBhJJbw4Rz2BOAKNBS5DQy4" +
                "FBRwoKBwF/XMzHiC3AUn+sEA+fgFQAAMASv/5Ae8DcwATABsAIwAAJREzERQOAiIuAjURMxEUFjI2AjQ" +
                "mIgYUFjIWIiY0NjIWFAG3OCU/RlBHPyU4WYJaVyg4KCg4ElxDQ1xDsgIL/f01TioUFCpONQID/fU9Sko" +
                "CcTgoKDgoLUNcQ0NcAAADAE7/9QHDAr0AEQAZACEAACEjNwYGIyI1ETMRFBYzMjURMyY0JiIGFBYyFiI" +
                "mNDYyFhQBwzcEGEklvDhHPYE4cSg4KCg4ElxDQ1xDMx4gtwFJ/rBAPn4BUDs4KCg4KC1DXENDXAAAAAM" +
                "ASv/5Ae8DaAATAB0AJwAAJREzERQOAiIuAjURMxEUFjI2AyM3NjMyFxYUBwcjNzYzMhcWFAcBtzglP0Z" +
                "QRz8lOFmCWlIsMwsVGwcBBbUsMwsVGwcBBbICC/39NU4qFBQqTjUCA/31PUpKAmZ2FxcGDgZcdhcXBg4" +
                "GAAADAE7/9QHDAqwAEQAbACUAACEjNwYGIyI1ETMRFBYzMjURMycjNzYzMhcWFAcHIzc2MzIXFhQHAcM" +
                "3BBhJJbw4Rz2BOHcsMwsVGwYCBbUsMwsVGwYCBTMeILcBSf6wQD5+AVAqdhcXBg4GXHYXFwYOBgAAAAE" +
                "ASv8rAe8CvQAgAAAFFwYjIiYmNTQ3JiY1ETMRFBYyNjURMxEUBgcGFRQWMjYBRyUgQREkJ1dQbDhZglo" +
                "4YkpiEyobfSYyCSghQTwGXF4CA/31PUpKPQIL/f1ZXQhSKQ8YEwABACT/KwG7AfUAIgAAIQYVFBYyNjc" +
                "XBiMiJiY1NDczNwYGIyI1ETMRFBYzMjURMxEBmGgTKhsOJSBBESQnYAQEGEklvDhHPYE4VygPGBMWJjI" +
                "JKCFEPzMeILcBSf6wQD5+AVD+CwAAAAMAPP/5AfgDHQAXAB8AJwAABSc2NTUGBiMiJjU1MxEUFjI2NxE" +
                "zERQGAiImNDYyFhQWIiY0NjIWFAGPDT0bWilqezhgiFgLOTfnHBMTHBOJHBMTHBMHJRdjjhgZaWf3/v9" +
                "GSTIyASz94ElTAtsTHBMTHBMTHBMTHAAAAAACAB8AAAIGA54ACQATAAAhITUBITUhFQEhASM3NjMyFxY" +
                "UBwIG/hkBmv5zAdT+ZgGg/vIsMwsVGwYCBTICVzMy/akC3nYXFwYOBgAAAgBOAAABvQKnAAkAEwAAISE" +
                "1ASE1IRUBIQMjNzYzMhcWFAcBvf6RARP+9gFR/usBKrEsMwsVGwYCBTIBkDMy/nAB53YXFwYOBgAAAAI" +
                "AHwAAAgYDGQAJABEAACEhNQEhNSEVASECBiImNDYyFgIG/hkBmv5zAdT+ZgGgxRQbFBQcEzICVzMy/ak" +
                "CtxQUGxQTAAAAAAIATgAAAb0CWgAJABEAACEhNQEhNSEVASECIiY0NjIWFAG9/pEBE/72AVH+6wEqqxo" +
                "VFBsUMgGQMzL+cAHkFRoUFBsAAgAfAAACBgPEAAkADwAAISE1ASE1IRUBIQMHJzcXNwIG/hkBmv5zAdT" +
                "+ZgGgSo6UJm1pMgJXMzL9qQNqjY0naGgAAAACAE4AAAG9AwMACQAPAAAhITUBITUhFQEhAwcnNxc3Ab3" +
                "+kQET/vYBUf7rASoNjpQmbWkyAZAzMv5wAqmNjSdoaAAAAAIAJf9IAgACxgAkADIAADczFhYyNjU0LgQ" +
                "1NDYzMhcUByYiBhUUFx4EFRQGIiYTJzY3NycmNjYyFhYVFCU5BWGYaDtYZ1g7dG1TPxE5k1xPI1VWRix" +
                "1533OKC0NBQoSARMODhWyNVJFSy5BIicmTDVGZh4CMx1AOUAkEBwiK0owXG9z/uAcGhQHAw0kEQEXDzo" +
                "AAAACACT/SAGMAgEAIAAuAAA3MxYWMjY0LgInJjQ2MzIWFxcHJiIGFRQeAxQGIiYXJzY3NycmNjYyFhY" +
                "VFCQ1Bk5dSjlSVCAmUVsgOAwMEyRsQUJVVDpZq2KUKC0NBQoSARMODhV/LS0pUy4aHR0iZVcPBwcuGi4" +
                "nJisZIEJuUFL7HBoUBwMNJBEBFw86AAEALgJPAVADAwAFAAABJwcnNxcBKmltJpSOAk9oaCeNjQAAAAE" +
                "ALgJPAVADAwAFAAABByc3FzcBUI6UJm1pAtyNjSdoaAAAAAEALgJGARACvAAPAAABFRQGIiY1NTMVFBY" +
                "yNjU1ARBCXkItJzonArwFL0JCLwUFHScnHQUAAAAAAQAAAoMAQwLGAAcAABIGIiY0NjIWQxQbFBQcEwK" +
                "XFBUaFBQAAv/+AiUA4AMHAAcADwAAEjQmIgYUFjIWIiY0NjIWFLMnOicnOhJeQkJeQgJ6OCgoOCgtQ1x" +
                "DQ1wAAAAAAQBM/y4BCQADABAAADcGFRQWMjY3FwYjIiYmNTQ35mgTKhsOJSBBESQnYANXKA8YExYmMgk" +
                "oIUQ/AAAAAQBOAl0BnAK/ABEAAAEyNxcGIyImJiMiByc2MzIWFgE9Jx8ZLTMSLTIZKSIZLzUSLTMCliM" +
                "nNRMXJCc1EhcAAAL//gI4AOQCxQAJABMAABMjNzYzMhcWFAcHIzc2MzIXFhQHmiwzCxUbBgIFtSwzCxU" +
                "bBgIFAjh2FxcGDgZcdhcXBg4GAAAAAAMATgKYASwDaAAHAA8AGQAAEiImNDYyFhQWIiY0NjIWFCcjNzY" +
                "zMhcWFAd8GhQUGhSIGhQUGhRaLDMLFRsGAgUCmBQaFBQaFBQaFBQaL3YXFwYOBgAAAAADAE4AAAJHAsU" +
                "ABwAKABQAACEjJyMHIxMzEwsCIzc2MzIXFhQHAkc8UOROO+A1SWRhZywzCxUbBgIF9fUCvP5wATn+xwE" +
                "MdhcXBg4GAAAAAAIATgAAAkMCxQAIABQAABMjNzYzMhcWBwEhESEVIRUzByMRIXosMwsVGwYFCAGC/rQ" +
                "BTv7qvxOsARQCOHYXFxAK/WwCvDTrN/7MAAACAE4AAAKlAsUACAAUAAATIzc2MzIXFgcBIxEhESMRMxE" +
                "hETN6LDMLFRsGBQgB5jj+wjg4AT44Ajh2FxcQCv1sAWb+mgK8/uEBHwAAAgBOAAABZQLFAAUADwAAISM" +
                "RJzUzByM3NjMyFxYUBwFlOEN76ywzCxUbBgIFAokCMYR2FxcGDgYAAAAAAwBO//UCZwLMAAsAFwAhAAA" +
                "BERQGIiY1ETQ2MhYDETQmIgYVERQWMjYBIzc2MzIXFhQHAmd7rH1xxm03VYxUV4dX/kosMwsVGwYCBQH" +
                "6/r9lX19lAUJnanD+XwFJSUpKSf62R0lHAcd2FxcGDgYAAAIATv/5AqkCxQAIACAAABMjNzYzMhcWBwE" +
                "nNjU1BgYjIiY1NTMRFBYyNjcRMxEUBnosMwsVGwYFCAGBDT0bWilqezhgiFgLOTcCOHYXFxAK/WUlF2O" +
                "OGBlpZ/f+/0ZJMjIBLP3gSVMAAgBOAAACrgLFACcAMQAAISM1Njc2NRE0JiMjIgYVERQXFhcWFxUjNzM" +
                "mNRE0NjMzMhYVERQHMwEjNzYzMhcWFAcCruRMGzhJO3A7SSAbWgcD5BFBRV5ecF5eSUX93SwzCxUbBgI" +
                "FMw8QIVEBPUNMTEP+wzwkHxABATMzK2YBM1xwcFz+zWQtAgV2FxcGDgYABABOAAABLALQAAMADAAUABw" +
                "AADMjETMnIzc2MzIXFgcGIiY0NjIWFBYiJjQ2MhYU2jg4BSwzCxUbBwQInhoUFBoUiBoUFBoUAfVOdhc" +
                "XEAqCExwTExwTExwTExwAAAAAAgAMAAACBQK8AAcACgAAISMnIwcjEzMTAwMCBTxQ5E474DVJZGH19QK" +
                "8/nABOf7HAAAAAAMATgAAAf8CvAARABkAIQAAISMRMzIWFAcGFRUWFhUUBwYGAzMyNjU0IyMRMzI1NCY" +
                "jIwE05t1SXkIBLDspFVPoozhAfp2skUw0vQK8VLEtAQEBFFpIUDsgJgGdPDl1/a6gRksAAAAAAQBOAAA" +
                "BnAK8AAUAADMjESEVIYY4AU7+6gK8NQAAAAACAAwAAAIFArwAAwAGAAAhIRMzEwMDAgX+B+A1mLOwArz" +
                "9dgIz/c0AAQBOAAABnAK8AAsAACEhESEVIRUzByMRIQGa/rQBTv7qvxOsARQCvDTrN/7MAAAAAQBOAAA" +
                "CNQK8AAkAACEhNQEhNSEVASECNf4ZAZr+cwHU/mYBoDICVzMy/akAAAAAAQBQAAAB/gK8AAsAACEjESE" +
                "RIxEzESERMwH+OP7CODgBPjgBZv6aArz+4QEfAAAAAwCO//UCMgLMAAsAEwAbAAABERQGIiY1ETQ2MhY" +
                "FFSE1NCYiBgE1IRUUFjI2AjJ7rH1xxm3+lAE1VYxUATX+y1eHVwH6/r9lX19lAUJnanBYnp5JSkr+bnR" +
                "1R0lHAAAAAQBQAAAAywK8AAUAADMjESc1M8s4Q3sCiQIxAAEATgAAAdsCvQALAAAhIwMHESMRMxETMwM" +
                "B20PiMDg44EHNAVlM/vMCvf6yAU7+0QAAAAABAAwAAAIFArwABgAAISMDAyMTMwIFPMO/O+A1AmX9mwK" +
                "8AAABAFAAAAJoArwADAAAISMRAyMDESMRMxMTMwJoOLY9tTg409U4Ahf96QIX/ekCvP2aAmYAAQBQAAA" +
                "CPAK8AAkAACEjAREjETMBETMCPDj+hDg4AXw4AlX9qwK8/asCVQADAE4AAAJLAr0AAwAMABUAAAEhNSE" +
                "3ISIHJzY2MyEDITchMjcXBgYB1f74AQg6/tBOGCsQRjsBRWr+uxUBME4YKxBGAWY37EYQODL9QzRGEDg" +
                "yAAACAD7/9QHiAswACwAXAAABERQGIiY1ETQ2MhYDETQmIgYVERQWMjYB4nusfXHGbTdVjFRXh1cB+v6" +
                "/ZV9fZQFCZ2pw/l8BSUlKSkn+tkdJRwAAAAABAFAAAAH+ArwABwAAISMRIREjESEB/jj+wjgBrgKF/Xs" +
                "CvAACAE4AAAIAArwACwAZAAATMzI2Njc2NTQmIyMRIxEzMhYVFA4DIyOGxiQyGAYIRTvCOPZfXQMUJEg" +
                "yxQEsHSQfIzdRUP15Arx0YiMxSy8jAAEATgAAAiICvgAPAAAhIRMDIQchEwMzMjY3FwYGAZH+veLSAaw" +
                "S/suwyOImOAwrEEYBgAE+Nf76/rAlIhA4MgABAE4AAAHgArwABwAAISMRIzUhFSMBMDiqAZKwAooyMgA" +
                "AAAABADz/+QH4ArwAFwAABSc2NTUGBiMiJjU1MxEUFjI2NxEzERQGAY8NPRtaKWp7OGCIWAs5NwclF2O" +
                "OGBlpZ/f+/0ZJMjIBLP3gSVMAAgBO/90CXQLHAB0AKAAABSc1IyImNRE0NxcGFREUFjMzETY2MzIWFRE" +
                "UBiMjNxE0JiMiFREzMjYBcDosX110HlpIPCwDOi9XZF1fMbVNLjoxPEgjDTRoWwEkmCUtF3n+0kJEAgw" +
                "yOG1b/uJbaLkBMkRFPv39RAAAAQBOAAACSQK8AAsAACEjAwMjEwMzExMzAwJJRbi5Rd3KP6yuP8sBJv7" +
                "aAWABXP7aASb+pAAAAAABAD0AAAJMAsUAIwAAISMnIyImNREzERQWMzMRMxEzMjY1NTQmJic3HgIVFRQ" +
                "GIyMBXzkBLF9dOEg8LDoxPEgODhEtGxoDXV8x1GdbASb+0EJEAbb+SkRCqCg1EhIQETsqKo9bZwAAAAM" +
                "AUAAAAS4DHQAHAA8AFQAAEiImNDYyFhQWIiY0NjIWFAMjESc1M34aFBQaFIgaFBQaFFI4Q3sC2xMcExM" +
                "cExMcExMc/RICiQIxAAADAAIAAAHaAxsABwAPABgAABIiJjQ2MhYUFiImNDYyFhQDIxEDMxMTMwOoHBM" +
                "THBOJHBMTHBNNONA/rK4/0ALZExwTExwTExwTExz9FAFUAWj+2gEm/poAAwBO//sB2QKnABgAJQAvAAA" +
                "TMhc3FwYVERYXByImBwYiJiYnJjU1NDY2FyYjIgYGFRUUFxYyNwMjNzYzMhcWFAfiUFETLAcGGBsGGxt" +
                "KUSo7DyUrQcloPBImIncHO0VqLDMLFRsHAQUB/CkpFkEg/sgcDiEDAwcKFxMvS7k4SBpdKQsyLL1xAwE" +
                "JAeR2FxcGDgYAAAIATv/1AacCpwAIACwAAAEjNzYzMhcWBxcmIwcGBhQWMzMHIyIGFBYzMjc3FwYiJyY" +
                "1NDcmJjQ3NjYyFwENLDMLFRsHBAgPKzEfICooJXcTZC80Pj5CPxQQTqkuNEsZHgIIVWg4Ahp2FxcQCrk" +
                "NAQMkPzY2NGE5GQgzIikuS2EfDT8oCzM2DwACAE7/LgG/AqcACAAbAAABIzc2MzIXFgcHNjMyFxYVESc" +
                "RNCcmIgcRIxEzASUsMwsVGwcECOgzXDQlVTccIoc9ODgCGnYXFxAKoysTJ2r91BgCETQdIyL+VwH1AAI" +
                "ATgAAAM4CpwAJAA0AABMjNzYzMhcWFAcDIxEzhCwzCxUbBgIFQzg4Ahp2FxcGDgb9igH1AAAABABO//Y" +
                "BygLQAAcADwAYACYAABIiJjQ2MhYUFiImNDYyFhQnIzc2MzIXFgcTETMRFCA1ETMRFBYzMsQaFBQaFIg" +
                "aFBQaFFcsMwsVGwcECDA4/oQ4Rz2IAh0THBMTHBMTHBMTHBN2FxcQCv4GAVD+t7a2AUn+sEA9AAAAAAI" +
                "ATv/7AdkB/AAYACUAABMyFzcXBhURFhcHIiYHBiImJicmNTU0NjYXJiMiBgYVFRQXFjI34lBREywHBhg" +
                "bBhsbSlEqOw8lK0HJaDwSJiJ3BztFAfwpKRZBIP7IHA4hAwMHChcTL0u5OEgaXSkLMiy9cQMBCQAAAAM" +
                "ATv9fAcACvQATACAAKgAAARYWFRUUBgYiJxUjETQ2MzIXFhQHIgcRFjMyNTU0JicmJxU2NzY1NCYjIgE" +
                "5O0w7ZGI5OEVHKx81Tks5Oy2aOCkPkjI+KSIkUwHuC1ZDuD9NGQqYArpNVxcmc1Ie/osKb7o0OwQBYk4" +
                "aEwwyGDUAAQAV/zoB5AH/AB8AABcmNTQ3Ny4CJwMzExYWFxM2NjcXDgMHBgcDBhQX3h0JFhsVIQ5sOWo" +
                "NGxFoECosJQQXCBMGEQt9FgvGGS4YGUkTEzUrAXT+lzAnCQFYNjsKHwIKBRAJHCL+XkEtEAAAAgBO//Y" +
                "BwwLBABkAJQAAEyY0NjMzByMiBhUUFxYXFhUVFCMiJjU1NDYTNTQmJwYVFRQWMzLXKDs7LRUhGxctbR4" +
                "huV9dRvc9P4lIPIEB+CZfRDMkDjIeSDA1P2jCZ1t+UGX+w38lYR0MjohCRAAAAAEATv/1AacB/wAjAAA" +
                "BJiMHBgYUFjMzByMiBhQWMzI3NxcGIicmNTQ3JiY0NzY2MhcBYSsxHyAqKCV3E2QvND4+Qj8UEE6pLjR" +
                "LGR4CCFVoOAG9DQEDJD82NjRhORkIMyIpLkthHw0/KAszNg8AAAABAE7/LwGyArwAGgAABQc1BiInJjU" +
                "0NzY3IzUhFwYHBgcGFBcWMzI3AZc4LWErWCRMptIBEBA7Rn0iCwINfzdLtxrZChgwa1RLnp8vMS5RkHs" +
                "kMg5pFAAAAQBO/y4BvwH+ABIAABM2MzIXFhURJxE0JyYiBxEjETOCM1w0JVU3HCKHPTg4AdMrEydq/dQ" +
                "YAhE0HSMi/lcB9QAAAAADAD7/+gG6AsYAEAAfACoAAAERFAYmJjU1NjcmNTQ2MxYWAxEmIgYGFRUUFxY" +
                "zNzY2AzYzMhc0JiIGFRQBumO3YgIzIl5LX2E4CzNtYRwlRSgnN91bYRARTnI2Afn+xllsAWtZlkAhQjp" +
                "BUwJs/mEBCwEWOCKcNCQxBAlIAUosAVFGPCgtAAAAAQBCAAAAegH1AAMAADMjETN6ODgB9QAAAQBO//8" +
                "BwAIAABEAACUXIiYmJycHFSMRFxU3MwcXFgG+AiM8HxxpNzg40Eq8fzMvMCUkJpA4xgIADeHjzbNEAAE" +
                "ATv/2Ah0CvAAeAAAlByYmJwMGBwYHAyMTPgI3JyYnNTIzMhYXExYXFhYCHSUsKhBoHQ8FCGo5bA4hFRs" +
                "XGkQCAzlBFI4XIgQXFR8KOzYBWA8nDR3+lwF0KzUTE0dMBCswO/4sRBUDCgAAAAEATv8uAeUB/gAYAAA" +
                "lByInBiMiJyYnFScRMxEWFxYzMjURNxEWAeUbGhIlS0xKDwI5ORgsMi1nOQMbIR8lKQgB+AkCvv50GBM" +
                "WcQFZDP5HHAAAAAEATgAAAc8B9QAGAAAhIwMzExMzATRNmTuFhjsB9f5FAbsAAAEATv8mAXwCxAAlAAA" +
                "lMjcRBzUGIyInJjU1NDY3JjQ2MzMHIyIHBhUUFxYXByYiBhUVFAEONjg2Ih5hMyRVOiY6Oy0VIRsOCS0" +
                "VMxAxXEQyEv78GtwGOilFuEZaBiBcRjMXDw4zHg0RLAw8ObptAAACAE7/9gHDAgAACwAWAAABFRQGIiY" +
                "1NTQ2MhYHNTQjIhUVFBYyNgHDXLpfYbJiOIGER3tDATyEVG5vU4RfZWnpjpGRjjxKSQABAEL/+gHaAfU" +
                "ADwAAJQcuAicmNRMhESMRIREWAdobAggVCBQB/vU4AXsFGyEBAgwJFyYBd/46AfX+UBwAAAAAAgBO/y0" +
                "BwwH7AAwAGAAAFwcRNDYyFhUVFAYiJyU1NCMiBhUVFBYyNoQ2YrlaXbYsAQeDN0tIeEXDEAIOWWdrXYd" +
                "YXjZ5lI5ATZU/Pj0AAAABAE7/bQF4AfkAIAAABSc2NTQnLgMnJjU1NDYzMhYXFwcmIgYVFRQWFxYWFAF" +
                "lKwosaxwfDQkOU1kgOAwMEyFqRkRkJSWTGw4PNhxDHB0ZEB0qjDVVDQcHLhgvJ3xCUT4XQkMAAgBO/+0" +
                "B8wIfABcAJgAAARUUIyImNTU0Njc2MxcWMjc2NxcGBxYWJyYiBhUVFBYzMjU1NCYmAcO5X10lHjE2JiE" +
                "vESckKSM8FBtuQFY5SDyBGhgBNofCZ1uzMEMPGQQFAwchDz0PDk5YCjQ3ukJEhpErRBwAAAAAAQBO//M" +
                "BewH0AAwAACUHJiY1ESM1IRUjERQBQBA4MngBLX0eKxBGOwE7NTX+xVAAAQBC//YBvgH1AA0AACURMxE" +
                "UIDURMxEUFjMyAYY4/oQ4Rz2IpQFQ/re2tgFJ/rBAPQAAAAIATv8oAl0B+wAdACgAAAUnJyMiJjU1NDc" +
                "XBhUVFBYzMxE2NjMyFhUVFAYjIzc1NCYjIhURMzI2AXA5ASxfXXQeWkg8LAM6L1dkXV8xtU0uOjE8SNg" +
                "NxmdbfZglLRd5h0JEAWQyOG1bdltnuIpERT7+pUQAAQBO/ywCIAH1ABQAAAUHIiMiJycDJxMDMxMTMwM" +
                "XFhcWFgIgHAEBUTFmlzWtqD+JkT+yeRUYFiasKGDQ/tgUAVMBWv7kARz+pPksDQwGAAABAE7/JQJdAfo" +
                "AIwAABSc1IyImNREzERQWMzMRMxEzMjY1NTQmJic3HgIVFRQGIyMBcDosX104SDwsOjE8SA4OES0bGgN" +
                "dXzHbDclnWwE3/r9CRAHH/jlEQrYoNRISEBE7KiqdW2cAAAEAQv/0AlYB9AAiAAAlNTQnNxYVFRQjIic" +
                "GIyI1NTQ3FwYVFRQWMjY3NTMVFhYyNgIeUyBroUYjJUShayBTO1QkAjoBJFU7spVoGSwoj4HINTXIgY8" +
                "oLBlolUZDOjuNjTs6QwADABUAAADzAl0AAwALABMAADMjETMmIiY0NjIWFBYiJjQ2MhYUoTg4XRwTExw" +
                "TiRwTExwTAfUmExwTExwTExwTExwAAAMATv/2AcoCXQAHAA8AHQAAEiImNDYyFhQWIiY0NjIWFBMRMxE" +
                "UIDURMxEUFjMyzBoUFBoUiBoUFBoUFjj+hDhHPYgCGxMcExMcExMcExMc/ncBUP63trYBSf6wQD0AAAM" +
                "ATv/2AcMCpwAIABQAHwAAASM3NjMyFxYHExUUBiImNTU0NjIWBzU0IyIVFRQWMjYBGywzCxUbBwQIY1y" +
                "6X2GyYjiBhEd7QwIadhcXEAr+xoRUbm9ThF9laemOkZGOPEpJAAACAE7/9gHKAqcACAAWAAABIzc2MzI" +
                "XFgcTETMRFCA1ETMRFBYzMgElLDMLFRsHBAgoOP6EOEc9iAIadhcXEAr+LwFQ/re2tgFJ/rBAPQAAAAI" +
                "ATv/0AmICpwAIACsAAAEjNzYzMhcWBxM1NCc3FhUVFCMiJwYjIjU1NDcXBhUVFBYyNjc1MxUWFjI2AW8" +
                "sMwsVGwcECHZTIGuhRiMlRKFrIFM7VCQCOgEkVTsCGnYXFxAK/jyVaBksKI+ByDU1yIGPKCwZaJVGQzo" +
                "7jY07OkMAAf//AjIAZwLIAA0AABMXFgYGIiYmNTQ3FwYHKAoSARMODhVAKC0NAncDDSQRARcPOjUcGhQ" +
                "AAAAB//4CMABmAsYADQAAEyc2NzcnJjY2MhYWFRQmKC0NBQoSARMODhUCMBwaFAcDDSQRARcPOgAAAAE" +
                "AC/+sAHMAQgANAAAXJzY3NycmNjYyFhYVFDMoLQ0FChIBEw4OFVQcGhQHAw0kEQEXDzoAAAAAAv//AjY" +
                "A/gLMAA0AGwAAExcWBgYiJiY1NDcXBgcXFxYGBiImJjU0NxcGBygKEgETDg4VQCgtDZIKEgETDg4VQCg" +
                "tDQJ7Aw0kEQEXDzo1HBoUBwMNJBEBFw86NRwaFAAAAv/+AjAA/QLGAA0AGwAAEyc2NzcnJjY2MhYWFRQ" +
                "XJzY3NycmNjYyFhYVFCYoLQ0FChIBEw4OFVcoLQ0FChIBEw4OFQIwHBoUBwMNJBEBFw86NRwaFAcDDSQ" +
                "RARcPOgAAAgAL/64BCgBEAA0AGwAAFyc2NzcnJjY2MhYWFRQXJzY3NycmNjYyFhYVFDMoLQ0FChIBEw4" +
                "OFVcoKhAFChIBEw4OFVIcGhQHAw0kEQEXDzo1HBgWBwMNJBEBFw86AAAAAQBOAJ4BswIDAAcAACQiJjQ" +
                "2MhYUAUqUaGiUaZ5plGholAAAAwALAAABsgBCAAcADwAXAAAyIiY0NjIWFBYiJjQ2MhYUFiImNDYyFhQ" +
                "6HBMTHBOdGhQUGhSgGhQUGhQUGhQUGhQUGhQUGhQUGhQUGgAAAAAHAE7/9QP2AuQABwAPABMAGwAjACs" +
                "AMwAABCImNDYyFhQmNCYiBhQWMgUnARcCIiY0NjIWFCY0JiIGFBYyACImNDYyFhQmNCYiBhQWMgOieFR" +
                "UeFQyNFQ0NFT84SMCNyhWeFRUeFQyNFQ0NFT+23hUVHhUMjRUNDRUC1R4VFR4F0o5OUo5JigCuyn9OlR" +
                "4VFR4F0o5OUo5AZBUeFRUeBdKOTlKOQAAAAABACoAUAEKAccABgAAJQcnNTcXBwEII7u7JZZyIrsBuya" +
                "WAAABAAMAUADjAccABgAANyc3JzcXFSgjlJYlu1AimZYmuwEAAAABAE7/jgHLAzEAAwAAFyMBM4s9AUQ" +
                "5cgOjAAAAAQBO//YB7gLGACsAACUGIyIuAjU1IzUzNSM1MzU0Njc2MzIXByYjIhUVMxUjFTMVIxUUFxY" +
                "zMjcB7lVNEEFJLTc3NzcrLC0+TUEQOTOc0dHR0X8KCzxVFyEGJ1U/RjcyN1tMThsZISYVk2Q3MjdEgww" +
                "CHgABAGkCAAHdArwAEgAAASM1ByMnFSM1IxUjNSM1Mxc3MwHdLigfKDA4MD/nJyZAAgB4eHh4jo6OLmx" +
                "sAAABAE4AAAJQAsMAJwAAISM1Njc2NRE0JiMjIgYVERQXFhcWFxUjNzMmNRE0NjMzMhYVERQHMwJQ5Ew" +
                "bOEk7cDtJIBtaBwPkEUFFXl5wXl5JRTMPECFRAT1DTExD/sM8JB8QAQEzMytmATNccHBc/s1kLQAAAAI" +
                "ATgAAAkcCvAADAAYAACEhEzMTAwMCR/4H4DWYs7ACvP12AjP9zQABAE4AAAIAAsIAIwAAATYzMhcHJiI" +
                "HBhUVMwcjESMRNDcmIyIGFRUzByMRIxE0NzYyAV8oOyYYFBgsFCVyGFo4CywnLTxyGFo4GiqSApgkETE" +
                "MDRk7MDX+QAIxHxwbOycwNf5AAjExJDwAAAACAE4AAAFqAsUAAwAVAAAhIxEzAyMRNDYzMhcHJiIHBhU" +
                "VMwcjAWo4OOQ4VjtDNSQuOhMychhaAfX+CwIxRFAxJRkKGUAwNQABAE4AAAFqAsMAEgAAEzQ2MhcRIxE" +
                "mIgcGFRUzByMRI05WhkA4LTsTMXIYWjgCMUROMv1vAm8YChk/MDX+QAAAAQBOAAACUALCACQAAAE2Mhc" +
                "RIxEmIgcGFRUzByMRIxE0NyYjIgYVFTMHIxEjETQ3NjIBXyqQNzgoOxUxchhaOAssJy08chhaOBoqkgK" +
                "YKSf9ZgJ1FAsbNjg1/kACMR8cGzsnMDX+QAIxMSQ8AAAAAAMATv/5AgoDHQAXAB8AJwAABSc2NTUGBiM" +
                "iJjU1MxEUFjI2NxEzERQGAiImNDYyFhQWIiY0NjIWFAGhDT0bWilqezhgiFgLOTfnGhQUGhSIGhQUGhQ" +
                "HJRdjjhgZaWf3/v9GSTIyASz94ElTAtsTHBMTHBMTHBMTHAAAAAACAE4AAAJHArwAAwAGAAAhIRMzEwM" +
                "DAkf+B+A1mLOwArz9dgIz/c0AAQASAAAHcAH1ADkAAAEDIyYCJwMjJgInAgcjJgInAyMmAicwAyMmAic" +
                "DIwMzFhIXEzMWExMzFhIXEzMSFzYTMxYSFxMzExMHcJtNEUMRZk0VVRVbJU0RQxFmTRVTFX9NEUMRZk2" +
                "ZOxZZFnE5K0OGPhZZFnE5Qys1UUEWWRZxOW6GAfX+C0QBDkP+a0UBFUX+1nVEAQ5D/mtFARBF/mZEAQ5" +
                "D/msB9Ur+2UoBu6b+6wG7Sv7ZSgG7/uumqgERSv7ZSgG7/kUBuwABAE7/8wHiAsMAGwAAEzQ2MhcVMwc" +
                "jERQXByYmNREmIgcGFRUzByMRI05WhkB4GGBCEDgyLTsTMXIYWjgCMUROMpw1/sRQFisQRjsB6xgKGT8" +
                "wNf5AAAAAAQAs//MBxwK8ABwAACUGByYmNQMVIxEUFwYHJiY1ETMVMzUzFTMHIxEUAZEFCzgyAbJCBQs" +
                "4MjizOHgYYB4RGhBGOwE9Af7ETxcRGhBGOwI4x8fHNf7ETwAAAAABAAIAAAHaArwACAAAISMRAzMTEzM" +
                "DAQo40D+srj/QAVQBaP7aASb+mgAAAAEADf86AeEB9QAHAAAXIzcDMxMTM7I7XMY/pLI/xtoB4f5iAZ4" +
                "AAAAD//0AAAHVAx0ACAAQABgAACEjEQMzExMzAwIiJjQ2MhYUFiImNDYyFhQBBTjQP6yuP9BfGhQUGhS" +
                "IGhQUGhQBVAFo/toBJv6aAYUTHBMTHBMTHBMTHAAAAgACAAAB2gNoAAgAEQAAASM3NjMyFxYHAyMRAzM" +
                "TEzMDAQQsMwsVGwYFCD840D+srj/QAtt2FxcQCvzJAVQBaP7aASb+mgAAAgAI/zoB3AKsAAcAEQAAFyM" +
                "3AzMTEzMnIzc2MzIXFhQHrTtcxj+ksj/eLDMLFRsGAgXG2gHh/mIBnip2FxcGDgYAAAADAAL/OgHWAl0" +
                "ABwAPABcAABIiJjQ2MhYUFiImNDYyFhQDIzcDMxMTM64cExMcE4kcExMcE7Y7XMY/pLI/AhsTHBMTHBM" +
                "THBMTHP0M2gHh/mIBngABAAAAAAHYArwACAAAISMRAzMTEzMDAQg40D+srj/QAVQBaP7aASb+mgAAAAE" +
                "ATv8vANEB9QANAAAXEScnMxEGBiMnMjY3NpktF3wCRDYHByAKGjgB9gM0/cA6TCsQCx0AAAAAAwBO/yw" +
                "DwAIfABwANABDAAAFByIjIicnAycTJyY1NDcXBhUUFxcTMwMXFhcWFgEVFCMiJjU1NDY3NjMXFjI3Njc" +
                "XBgcWFicmIgYVFRQWMzI1NTQmJgPAHAEBUTFmlzWtTR4sJRYgMJE/snkVGBYm/gi5X10lHjE2JiEvESc" +
                "kKSM8FBtuQFY5SDyBGhisKGDQ/tgUAVOePi81MiMhIihDYwEc/qT5LA0MBgHhh8JnW7MwQw8ZBAUDByE" +
                "PPQ8OTlgKNDe6QkSGkStEHAAAAgBO/+0DFQIfACcANgAAJQYHJiY1ESMnBgcWFhUVFCMiJjU1NDY3NjM" +
                "XFjI3NjcWFjMhFSMRFAEmIgYVFRQWMzI1NTQmJgLaBQs4Ml43FCMTHLlfXSUeMTYmIS8RJyQiFgcBDH3" +
                "+vUBWOUg8gRoYHhEaEEY7ATsbDggOTzGHwmdbszBDDxkEBQMHISMINf7FUAGMCjQ3ukJEhpErRBwAAAE" +
                "ATv/0A7gCvABEAAAlByYmJyYnBgYHAwYHJiYnJicGBwYCByMTPgI3LgQnNTIzMhYXExYWFz4ENy4EJzU" +
                "yMzIWFxIXHgMDuCUsKhExNhgWC2ADMSsrETUyHQ8GXxI5bA4hFRsCEA4aIhkCAzlBFJoGEgwQQB4hFRs" +
                "CEA4aIhkCAzlBFIkUEBYIFxUfCjs4qK4NKyj+rgIhCz03rakPJw/+uDwBdCs1ExMGMiIqEQIrMDv+DhM" +
                "YBjfYYjUTEwYyIioRAiswO/4uJx8TBQoAAAABABX/OgN0Af8ASAAAFyY1NDY3LgInAzMeBRc2NzY2NxU" +
                "XHgIXFhc2NzY2NxYWFw4DBwYHBgMGFBcwByY1NDY3LgInJicGBgIHBhQXBt4cDhAbFSEObDkMNBAWDR4" +
                "SOS8QKiwnOhwLCRMeOS8QKiwGGQYEFwgTBhELKVQWCyYcDhAbFSEPLy4WJlMVFgsYxhcvGCs4ExM1KwF" +
                "0K6w5VCkyCrigNjsKAR7FbicZMRC4oDY7CgUVBQIKBRAJHCKM/upBLRAeFy8YKzgTEzUwmaUYef7oRUE" +
                "tEBQAAAAAAQBO/zoDcQH/ADMAAAEGBxYWFxYUFyImJicnBxUjEQYGAgcGFBcGByY1NDY3LgInAzMeBBc" +
                "+AjcXFTY3A1EjmVRcKgEBIzwfHGk3OCMsUxUWCw4YHA4QGxUhDmw5GDgWDR4SRDQqLD8lqwH1Jah4fwI" +
                "IIAglJCaQOMYB0hOM/uhFQS0QChQXLxgrOBMTNSsBdFa6VCkyCuSqOwoM4Sm6AAIATgAAAsYCxQAIABE" +
                "AABMjNzYzMhcWBwEjEQMzExMzA3osMwsVGwYFCAE3ONA/rK4/0AI4dhcXEAr9bAFUAWj+2gEm/poAAAA" +
                "AHAFWAAEAAAAAAAAAYwAAAAEAAAAAAAEACgBjAAEAAAAAAAIABwBtAAEAAAAAAAMAKwB0AAEAAAAAAAQ" +
                "AEgCfAAEAAAAAAAUADQCxAAEAAAAAAAYAEQC+AAEAAAAAAAcAOgDPAAEAAAAAAAgAEgEJAAEAAAAAAAk" +
                "AEgEJAAEAAAAAAAsAEwEbAAEAAAAAAAwAEwEbAAEAAAAAAA0AkAEuAAEAAAAAAA4AGgG+AAMAAQQJAAA" +
                "AxgHYAAMAAQQJAAEAFAKeAAMAAQQJAAIADgKyAAMAAQQJAAMAVgLAAAMAAQQJAAQAJAMWAAMAAQQJAAU" +
                "AGgM6AAMAAQQJAAYAIgNUAAMAAQQJAAcAdAN2AAMAAQQJAAgAJAPqAAMAAQQJAAkAJAPqAAMAAQQJAAs" +
                "AJgQOAAMAAQQJAAwAJgQOAAMAAQQJAA0BIAQ0AAMAAQQJAA4ANAVUQ29weXJpZ2h0IChjKSAyMDA4IEF" +
                "uZHJlYXMgS2FscGFraWRpcyAoaGVsbG9AaW5kZXJlc3RpbmcuY29tKSwgd2l0aCBSZXNlcnZlZCBGb25" +
                "0IE5hbWUgIkFkdmVudCBQcm8iQWR2ZW50IFByb1JlZ3VsYXJBbmRyZWFzS2FscGFraWRpczogQWR2ZW5" +
                "0IFBybyBSZWd1bGFyOiAyMDA4QWR2ZW50IFBybyBSZWd1bGFyVmVyc2lvbiAyLjAwM0FkdmVudFByby1" +
                "SZWd1bGFyQWR2ZW50IFBybyBUaGluIGlzIGEgdHJhZGVtYXJrIG9mIElOREUgQW5kcmVhcyBLYWxwYWt" +
                "pZGlzLkFuZHJlYXMgS2FscGFraWRpc3d3dy5pbmRlcmVzdGluZy5jb21UaGlzIEZvbnQgU29mdHdhcmU" +
                "gaXMgbGljZW5zZWQgdW5kZXIgdGhlIFNJTCBPcGVuIEZvbnQgTGljZW5zZSwgVmVyc2lvbiAxLjEuIFR" +
                "oaXMgbGljZW5zZSBpcyBhdmFpbGFibGUgd2l0aCBhIEZBUSBhdDogaHR0cDovL3NjcmlwdHMuc2lsLm9" +
                "yZy9PRkxodHRwOi8vc2NyaXB0cy5zaWwub3JnL09GTABDAG8AcAB5AHIAaQBnAGgAdAAgACgAYwApACA" +
                "AMgAwADAAOAAgAEEAbgBkAHIAZQBhAHMAIABLAGEAbABwAGEAawBpAGQAaQBzACAAKABoAGUAbABsAG8" +
                "AQABpAG4AZABlAHIAZQBzAHQAaQBuAGcALgBjAG8AbQApACwAIAB3AGkAdABoACAAUgBlAHMAZQByAHY" +
                "AZQBkACAARgBvAG4AdAAgAE4AYQBtAGUAIAAiAEEAZAB2AGUAbgB0ACAAUAByAG8AIgBBAGQAdgBlAG4" +
                "AdAAgAFAAcgBvAFIAZQBnAHUAbABhAHIAQQBuAGQAcgBlAGEAcwBLAGEAbABwAGEAawBpAGQAaQBzADo" +
                "AIABBAGQAdgBlAG4AdAAgAFAAcgBvACAAUgBlAGcAdQBsAGEAcgA6ACAAMgAwADAAOABBAGQAdgBlAG4" +
                "AdAAgAFAAcgBvACAAUgBlAGcAdQBsAGEAcgBWAGUAcgBzAGkAbwBuACAAMgAuADAAMAAzAEEAZAB2AGU" +
                "AbgB0AFAAcgBvAC0AUgBlAGcAdQBsAGEAcgBBAGQAdgBlAG4AdAAgAFAAcgBvACAAVABoAGkAbgAgAGk" +
                "AcwAgAGEAIAB0AHIAYQBkAGUAbQBhAHIAawAgAG8AZgAgAEkATgBEAEUAIABBAG4AZAByAGUAYQBzACA" +
                "ASwBhAGwAcABhAGsAaQBkAGkAcwAuAEEAbgBkAHIAZQBhAHMAIABLAGEAbABwAGEAawBpAGQAaQBzAHc" +
                "AdwB3AC4AaQBuAGQAZQByAGUAcwB0AGkAbgBnAC4AYwBvAG0AVABoAGkAcwAgAEYAbwBuAHQAIABTAG8" +
                "AZgB0AHcAYQByAGUAIABpAHMAIABsAGkAYwBlAG4AcwBlAGQAIAB1AG4AZABlAHIAIAB0AGgAZQAgAFM" +
                "ASQBMACAATwBwAGUAbgAgAEYAbwBuAHQAIABMAGkAYwBlAG4AcwBlACwAIABWAGUAcgBzAGkAbwBuACA" +
                "AMQAuADEALgAgAFQAaABpAHMAIABsAGkAYwBlAG4AcwBlACAAaQBzACAAYQB2AGEAaQBsAGEAYgBsAGU" +
                "AIAB3AGkAdABoACAAYQAgAEYAQQBRACAAYQB0ADoAIABoAHQAdABwADoALwAvAHMAYwByAGkAcAB0AHM" +
                "ALgBzAGkAbAAuAG8AcgBnAC8ATwBGAEwAaAB0AHQAcAA6AC8ALwBzAGMAcgBpAHAAdABzAC4AcwBpAGw" +
                "ALgBvAHIAZwAvAE8ARgBMAAAAAgAAAAAAAP+1ADIAAAAAAAAAAAAAAAAAAAAAAAAAAAGcAAAAAQACAAM" +
                "ABAAFAAYABwAIAAkACgALAAwADQAOAA8AEAARABIAEwAUABUAFgAXABgAGQAaABsAHAAdAB4AHwAgACE" +
                "AIgAjACQAJQAmACcAKAApACoAKwAsAC0ALgAvADAAMQAyADMANAA1ADYANwA4ADkAOgA7ADwAPQA+AD8" +
                "AQABBAEIAQwBEAEUARgBHAEgASQBKAEsATABNAE4ATwBQAFEAUgBTAFQAVQBWAFcAWABZAFoAWwBcAF0" +
                "AXgBfAGAAYQCjAIQAhQC9AJYAhgCOAIsAnQCpAQIAigDaAIMAkwCNAJcAiADeAKoAogCtAMkAxwCuAGI" +
                "AYwCQAGQAywBlAMgAygDPAMwAzQDOAOkAZgDTANAA0QCvAGcA8ACRANYA1ADVAGgA6wDtAIkAagBpAGs" +
                "AbQBsAG4AoABvAHEAcAByAHMAdQB0AHYAdwB4AHoAeQB7AH0AfAC4AKEAfwB+AIAAgQDsAO4AugEDAQQ" +
                "BBQEGAQcBCAD9AP4BCQEKAQsBDAD/AQABDQEOAQ8BAQEQAREBEgETARQBFQEWARcBGAEZAPgA+QEaARs" +
                "BHAEdAR4BHwEgASEBIgEjASQBJQEmAScA+gDXASgBKQEqASsBLAEtAS4BLwEwATEBMgDiAOMBMwE0ATU" +
                "BNgE3ATgBOQE6ATsBPAE9AT4AsACxAT8BQAFBAUIBQwFEAUUBRgFHAUgA/ADkAOUBSQFKAUsBTAFNAU4" +
                "BTwFQAVEBUgFTAVQBVQFWAVcBWAFZAVoAuwFbAVwBXQFeAOYA5wFfAWAA2ADhANsA3ADdAOAA2QDfAWE" +
                "BYgFjAWQBZQFmAWcBaAFpAWoBawFsAW0BbgFvAXABcQFyAXMBdAF1AXYBdwF4AXkBegF7AXwBfQF+AX8" +
                "BgAGBAYIBgwGEAYUBhgGHAYgBiQGKAYsBjAGNAY4BjwGQAZEBkgGTAZQBlQGWAJsBlwGYAZkBmgGbAZw" +
                "BnQGeAZ8BoAGhAaIBowGkALYAtwDEALQAtQDFAIcAqwDGAL4AvwC8AaUAjACfAKgBpgGnAagBqQGqAas" +
                "BrAGtAa4BrwGwAbEBsgGzAbQBtQG2AbcBuAG5AboBuwG8Ab0HdW5pMDBBRAdBbWFjcm9uB2FtYWNyb24" +
                "GQWJyZXZlBmFicmV2ZQdBb2dvbmVrB2FvZ29uZWsLQ2NpcmN1bWZsZXgLY2NpcmN1bWZsZXgKQ2RvdGF" +
                "jY2VudApjZG90YWNjZW50BkRjYXJvbgZkY2Fyb24GRGNyb2F0B0VtYWNyb24HZW1hY3JvbgpFZG90YWN" +
                "jZW50CmVkb3RhY2NlbnQHRW9nb25lawdlb2dvbmVrBkVjYXJvbgZlY2Fyb24LR2NpcmN1bWZsZXgLZ2N" +
                "pcmN1bWZsZXgKR2RvdGFjY2VudApnZG90YWNjZW50DEdjb21tYWFjY2VudAxnY29tbWFhY2NlbnQLSGN" +
                "pcmN1bWZsZXgLaGNpcmN1bWZsZXgESGJhcgRoYmFyBkl0aWxkZQZpdGlsZGUHSW1hY3JvbgdpbWFjcm9" +
                "uB0lvZ29uZWsHaW9nb25lawtKY2lyY3VtZmxleAtqY2lyY3VtZmxleAxLY29tbWFhY2NlbnQMa2NvbW1" +
                "hYWNjZW50DGtncmVlbmxhbmRpYwZMYWN1dGUGbGFjdXRlDExjb21tYWFjY2VudAxsY29tbWFhY2NlbnQ" +
                "GTGNhcm9uBmxjYXJvbgZOYWN1dGUGbmFjdXRlDE5jb21tYWFjY2VudAxuY29tbWFhY2NlbnQGTmNhcm9" +
                "uBm5jYXJvbgNFbmcDZW5nB09tYWNyb24Hb21hY3Jvbg1PaHVuZ2FydW1sYXV0DW9odW5nYXJ1bWxhdXQ" +
                "GUmFjdXRlBnJhY3V0ZQxSY29tbWFhY2NlbnQMcmNvbW1hYWNjZW50BlJjYXJvbgZyY2Fyb24GU2FjdXR" +
                "lBnNhY3V0ZQtTY2lyY3VtZmxleAtzY2lyY3VtZmxleAxUY29tbWFhY2NlbnQMdGNvbW1hYWNjZW50BlR" +
                "jYXJvbgZ0Y2Fyb24EVGJhcgR0YmFyBlV0aWxkZQZ1dGlsZGUHVW1hY3Jvbgd1bWFjcm9uBlVicmV2ZQZ" +
                "1YnJldmUFVXJpbmcFdXJpbmcNVWh1bmdhcnVtbGF1dA11aHVuZ2FydW1sYXV0B1VvZ29uZWsHdW9nb25" +
                "lawZaYWN1dGUGemFjdXRlClpkb3RhY2NlbnQKemRvdGFjY2VudAxTY29tbWFhY2NlbnQMc2NvbW1hYWN" +
                "jZW50DWRpZXJlc2lzdG9ub3MKQWxwaGF0b25vcwxFcHNpbG9udG9ub3MIRXRhdG9ub3MJSW90YXRvbm9" +
                "zDE9taWNyb250b25vcwxVcHNpbG9udG9ub3MKT21lZ2F0b25vcxFpb3RhZGllcmVzaXN0b25vcwVBbHB" +
                "oYQRCZXRhBUdhbW1hB3VuaTAzOTQHRXBzaWxvbgRaZXRhA0V0YQVUaGV0YQRJb3RhBUthcHBhBkxhbWJ" +
                "kYQJNdQJOdQJYaQdPbWljcm9uAlBpA1JobwVTaWdtYQNUYXUHVXBzaWxvbgNQaGkDQ2hpA1BzaQxJb3R" +
                "hZGllcmVzaXMTVXBzaWxvbmRpZXJlc2lzX2FsdAphbHBoYXRvbm9zDGVwc2lsb250b25vcwhldGF0b25" +
                "vcwlpb3RhdG9ub3MUdXBzaWxvbmRpZXJlc2lzdG9ub3MFYWxwaGEEYmV0YQVnYW1tYQVkZWx0YQdlcHN" +
                "pbG9uBHpldGEDZXRhBXRoZXRhBGlvdGEFa2FwcGEGbGFtYmRhB3VuaTAzQkMCbnUCeGkHb21pY3JvbgN" +
                "yaG8Gc2lnbWExBXNpZ21hA3RhdQd1cHNpbG9uA3BoaQNjaGkDcHNpBW9tZWdhDGlvdGFkaWVyZXNpcw9" +
                "1cHNpbG9uZGllcmVzaXMMb21pY3JvbnRvbm9zDHVwc2lsb250b25vcwpvbWVnYXRvbm9zBEV1cm8DZl9" +
                "mA2ZfaQNmX2wFZl9mX2wCQ1IPVXBzaWxvbmRpZXJlc2lzBF8xOTYFd193X3cDZl90A3RfdAVZX2FsdAV" +
                "5X2FsdA1ZZGllcmVzaXNfYWx0CllhY3V0ZV9hbHQKeWFjdXRlX2FsdA15ZGllcmVzaXNfYWx0C1Vwc2l" +
                "sb25fYWx0CGRvdGxlc3NqCXNpZ21hX2NoaQlzaWdtYV90YXUNbGFtYmRhX2xhbWJkYQtnYW1tYV9nYW1" +
                "tYQtnYW1tYV9rYXBwYRBVcHNpbG9udG9ub3NfYWx0AAAAAAEAAf//AA8AAAABAAAAAMmJbzEAAAAAyvg" +
                "vuQAAAADK+KLHAAEAAAAMAAAAFgAeAAIAAQABAZsAAQAEAAAAAQAAAAIAAQAAAAAAAAABAAAACgAqADg" +
                "AA0RGTFQAFGdyZWsAFGxhdG4AFAAEAAAAAP//AAEAAAABa2VybgAIAAAAAQAAAAEABAACAAAAAQAIAAE" +
                "BMAAEAAAAkwJaAmACdgLcAuoC+AMSAzQDPgNcA3YDmAOmA8QD3gPsBAoEFARaBGgEogTgBTIFUAVuBYQ" +
                "FjgW0BeIGBAYKBhAGHgYoBjIGQAZeBmwGxgbUBuoHBAcKBxwHJgcsBzYHPAdCB0wHUgdYB14HZAdqB2o" +
                "HcAd2B3wHggeIB44HlAeaB6AHpgesB7IHuAgMB74HxAfQB8oILgfKB9AH1gfcB+IMAAfoB/IH+AgCCAw" +
                "IEggiCBgIIggoCC4INAh6CIAIigiQCJYInAiiCKwItgi8D6gIwgjICM4I1AkmCTAJOgl4CZIJmAmiCbg" +
                "L6gv0C/oMAAwGDpwO/g8EDw4PGA8mDzQPPg9ED0oPVA9eD2QPag94D34PhA+KD5APlg+cD6IPqA+uD7Q" +
                "PugABAJMABQAKACQAJQAmACcAKQAqAC0ALgAvADEAMgAzADQANQA2ADcAOAA5ADoAPABEAEUARgBHAEg" +
                "ASQBKAEsATABOAE8AUABRAFIAUwBVAFYAWQBaAFsAXABdALwAvgDAAMEAxADFAMYAyADOANAA0gDUANY" +
                "A2QDbAN4A4ADhAOQA6QDvAPEA9QD2APcA+AD/AQEBAwEFAQYBBwEIAQkBDwESARMBFAEWARgBGQEaARw" +
                "BIgElATABMQE1ATgBOQE6ATsBPAFBAUMBRwFIAUkBSgFLAUwBTQFOAVEBUgFTAVYBVwFYAVkBWgFbAVw" +
                "BYAFhAWIBYwFkAWUBZgFoAWkBagFrAW0BcAFxAXIBcwF0AXUBhAGFAYcBiQGOAY8BkAGRAZQBlwGYAZk" +
                "AAQAk/zoABQAF/1wACv9kAEf+wgBP/4gAV/+gABkABf86AAr/LgAm/8QAKv/EADL/4AA0/9wAN/+kADj" +
                "/vAA5/5gAOv+mADz/igBE/+QARv/kAEf/5gBI/+4AUv/iAFP/6gBU/+QAVv/qAFf/6gBY/+YAWf+sAFr" +
                "/rABc/9YBdf+2AAMAD/+cABH/kAAk/7QAAwAP/9QAEf/MACT/6AAGAA//nAAR/44AJP+0ADn/vAA6/7Y" +
                "APP+sAAgAD/7mABH+3gAk/0QARP88AEj/YgBM/7AAUv9eAFX/VAACAA//1gAR/8wABwAP/7gAEf+uACT" +
                "/xgBE/8QASP/GAFL/xABY/8QABgAm/84AMv/qAEj/8ABS/+wAWP/uAFz/3gAIAAX+6gAK/uQAN/+wADn" +
                "/qgA6/7YAPP8yAFz/5gF1/7YAAwAP/8QAEf+6ACT/3AAHAA//yAAR/7oAJP/eADf/6gA5/+oAOv/mADz" +
                "/1AAGAA/+xgAR/roAJP+WAET/wgBI/9oAUv/WAAMAD/7UABH+uAA4/sIABwAy/9wAN//WADj/uAA5/9w" +
                "AOv/UADz/2wBc/9AAAgAP/7oAEf+sABEAD/+GABD/oAAR/3wAHf+cAB7/mgAk/5wAMv/sAET/nABG/5E" +
                "ASP+mAEv/9gBS/6QAVf+aAFb/kQBY/7AAWv/CAFz/pAADAA//pgAR/5gAJP+8AA4AD/+GABD/xgAR/3w" +
                "AHf/CAB7/sgAk/5YAKv/SADL/7ABE/7QASP/GAFL/xABV/9sAWP/iAFz/7gAPAA//lAAQ/8gAEf+MAB3" +
                "/xAAe/7oAJP+oADL/6ABE/7oASP/KAEv/7ABM//AAUv/GAFX/7gBY/+IAXP/UABQAD//GABD/0gAR/7o" +
                "AHf/QAB7/2gAk/9oAMv/YADb/2gBE//YARf/hAEj/9gBM/8gAUf/2AFL/2gBT/+EAVP/sAFn/9gBb/8w" +
                "AXf/XAOH/4QAHAEX/0ABK/+4AU//QAFf/5gBZ/+AAWv/gAFz/4AAHAA//vAAR/64ARf+6AE//uABY/9g" +
                "AWf/KAFz/ygAFABH/6gBL/94ATv/cAE//2gBc/+gAAgBH/+4AXP/gAAkAD//SABH/ygBF/8wASv/qAFP" +
                "/zABZ/9wAWv/cAFv/4gBc/9wACwAF/74ACv/IAA//pgAR/54AFP/QAET/uABI/9IATP/0AE//6ABS/9A" +
                "BdQASAAgAEf/mAET/8ABI//IASv/wAEz/2gBS//AAVf/YAFz/4gABAFz/yAABAFn/7AADAEj/6ABS/9w" +
                "AXP/OAAIAWv/kAFz/xAACAFj/2gBc/8wAAwBY/84AWf/CAFz/wAAHAA//0AAR/8IASv/yAFn/4ABa/+A" +
                "AW//qAFz/5AADAA//tgAR/6gAXP/IABYAD/9mABD/rAAR/1wAHf+oAB7/mABE/5oARv/MAEf/1gBI/9I" +
                "ASv/QAEz/5gBO/94AT//cAFD/4ABR/+AAUv/QAFP/3gBU/84AVf/kAFb/1ABX//QAXP/uAAMAD//cABH" +
                "/0ABa/8gABQAP/5AAEf+IAET/xgBI/94AUv/YAAYAD/+UABH/jABE/8oASP/iAEv/5ABS/9wAAQBI/+Q" +
                "ABAAR/9oARP/kAEj/7ABS/+gAAgBI//IAUv/gAAEA6f//AAIAwP//AMH//wABAL7//wABAL///wACAMb" +
                "//wDx//8AAQDE//8AAQGD//8AAQD3//8AAQDP//8AAQDW//8AAQDQ//8AAQDU//8AAQEJ//8AAQDZ//8" +
                "AAQDg//8AAQFA//8AAQC3//8AAQFB//8AAQDq//8AAQFD//8AAQD1//8AAQDz//8AAQDy//8AAQD4//8" +
                "AAQED//8AAQFI//8AAQEl//8AAQEB//8AAQDT//8AAQEm//8AAQFF//8AAgES//8BHP//AAEBB///AAI" +
                "BA///ARL//wACARP//wEb//8AAQEU//8AAQFL//8AAgEO//8BSf//AAEBW///AAEBPv//AAEBGP//ABE" +
                "BDP//AQ3//wEO//8BD///ARD//wFK//8BS///AU7//wFY//8BW///AV3//wFi//8BZ///AWj//wFp//8" +
                "Bif//AYv//wABATj//wACANL//wFY//8AAQGW//8AAQFa//8AAQDm//8AAQDx//8AAgFG//8BTv//AAI" +
                "BBf//AWb//wABAWj//wABAWn//wABAUf//wABAWv//wABAP///wAUAVb//wFX//8BWP//AVn//wFa//8" +
                "BXP//AV3//wFf//8BYP//AWL//wFj//8BZP//AWX//wFm//8BaP//AWn//wFq//8Ba///AW3//wFu//8" +
                "AAgFo//8Bc///AAIBUv//AWH//wAPAVn//wFa//8BW///AVz//wFd//8BX///AWP//wFl//8BZv//AWf" +
                "//wFo//8Bav//AWv//wFt//8Bbv//AAYBWP//AWL//wFo//8Baf//AWv//wFu//8AAQFZ//8AAgFa//8" +
                "Biv//AAUBWf//AVv//wFc//8BZP//AWj//wCMALb//wC3//8AuP//ALn//wC6//8Au///ALz//wC9//8" +
                "Avv//AL///wDA//8Awf//AML//wDD//8AxP//AMX//wDG//8Ax///AMj//wDJ//8Ayv//AMv//wDM//8" +
                "Azf//AM7//wDP//8A0P//ANH//wDS//8A0///ANT//wDV//8A1v//ANf//wDY//8A2f//ANr//wDb//8" +
                "A4///AOb//wDn//8A6P//AOn//wDq//8A6///AO3//wDx//8A8v//APP//wD0//8A9f//APb//wD3//8" +
                "A+f//APr//wD7//8A/P//AQX//wEG//8BB///AQj//wEJ//8BEv//ARP//wEU//8BFf//ARn//wEa//8" +
                "BG///ARz//wEd//8BJf//ASb//wE4//8BOf//ATr//wE8//8BPf//AT7//wE///8BQf//AUL//wFD//8" +
                "BRP//AUb//wFH//8BSP//AUn//wFL//8BTP//AU3//wFO//8BUf//AVL//wFT//8BVP//AVX//wFW//8" +
                "BV///AVj//wFZ//8BWv//AVv//wFc//8BXf//AV7//wFf//8BYP//AWL//wFj//8BZP//AWX//wFm//8" +
                "BZ///AWj//wFp//8Bav//AWv//wFt//8Bbv//AXD//wFx//8Bcv//AXP//wGC//8Bg///AYn//wGL//8" +
                "Bjv//AY///wGQ//8Bkf//AZL//wGT//8BlP//AZb//wGX//8BmP//AZn//wGa//8AAgFb//8BXf//AAE" +
                "BYf//AAEBYv//AAEBY///AKUAt///ALn//wC7//8AvP//AL3//wC+//8Av///AMD//wDB//8Awv//AMP" +
                "//wDE//8Axf//AMb//wDH//8AyP//AMn//wDK//8Ay///AMz//wDN//8Azv//AM///wDQ//8A0f//ANL" +
                "//wDT//8A1P//ANX//wDW//8A1///ANj//wDZ//8A2v//ANv//wDd//8A4P//AOP//wDm//8A5///AOj" +
                "//wDp//8A6v//AOv//wDt//8A8f//APL//wDz//8A9P//APX//wD2//8A9///APj//wD5//8A+v//APv" +
                "//wD8//8A////AQD//wEB//8BAv//AQP//wEE//8BBf//AQb//wEH//8BCP//AQn//wEM//8BDf//AQ7" +
                "//wEP//8BEP//ARH//wES//8BE///ART//wEV//8BFv//ARf//wEY//8BGf//ARr//wEb//8BHP//AR3" +
                "//wEf//8BIP//ASH//wEi//8BJf//ASb//wE0//8BNv//ATf//wE5//8BOv//ATz//wE9//8BPv//AT/" +
                "//wFA//8BQf//AUL//wFD//8BRP//AUX//wFG//8BR///AUj//wFK//8BS///AUz//wFO//8BT///AVH" +
                "//wFS//8BU///AVT//wFV//8BVv//AVf//wFY//8BWf//AVr//wFb//8BXP//AV3//wFf//8BYP//AWL" +
                "//wFj//8BZP//AWX//wFm//8BZ///AWj//wFp//8Bav//AWv//wFt//8Bbv//AW///wFw//8Bcf//AXL" +
                "//wFz//8Bgv//AYP//wGJ//8Bi///AY3//wGO//8Bj///AZD//wGR//8Bkv//AZP//wGU//8Blf//AZb" +
                "//wGX//8BmP//AZn//wGa//8AGAE6//8BRP//AUX//wFK//8BTv//AVj//wFb//8BXf//AWL//wFj//8" +
                "BZf//AWf//wFo//8Baf//AWr//wGO//8BkP//AZH//wGS//8Blv//AZf//wGY//8Bmf//AZr//wABAWb" +
                "//wACAUf//wFo//8AAgFn//8BbP//AAMBSf//AWv//wFx//8AAwFL//8Ba///AXD//wACAWr//wFs//8" +
                "AAQFu//8AAQFV//8AAgFR//8Bcv//AAIBGf//AXH//wABAXL//wABAXT/oQADAFb/tgBX/+4Bdf+hAAE" +
                "Bh///AAEBlP//AAEBhf//AAEA4///AAEBj///AAEBkP//AAEBkf//AAEBkv//AAEBif//AAEBmP//AAE" +
                "Bmf//AAEBmv//AAEAAAAKACgAKAADREZMVAAUZ3JlawAUbGF0bgAUAAQAAAAA//8AAAAAAAAAAAABAAA" +
                "AAA==') format('truetype');" +
                "font-weight: normal;" +
                "font-style: normal;" +
                "}";
            return this;
        }
        this.isAppended = false;
        this.append = function(ieScale) {
            this.isAppended = true;
            var coordinates = [0, 0];
            var container = d3.select(_container_);
            if (ieScale) {
                container = container.append("div")
                    .style("width", styleW)
                    .style("height", styleH)
                    .style("padding", "0px")
                    .style("display", "block")
                    .style("position", position)
                    .style("top", top)
                    .style("left", left)
                    .style("overflow", "hidden")
                    .style("line-height", "normal")
                    .style("margin", styleMargin);
                canvas = container.append("canvas") //default css values for canvas are none
                    .style("width", "100%")
                    .style("height", "auto")
                    .style("visibility", "hidden");
                this.setCanvasDims(attrW, attrH);
            }
            var svg = container.append("svg")
                .attr("preserveAspectRatio", "none")
                .attr("data-lexType", "lexiconRainbow")
                .attr("id", ID)
                .attr("viewBox", function() {
                    return _this_.setViewBox(attrX, attrY, attrW, attrH)
                })
                .style("width", ieScale ? "100%" : styleW)
                .style("height", ieScale ? "auto" : styleH)
                .style("padding", "0px")
                .style("display", "block")
                .style("position", ieScale ? "absolute" : position)
                .style("top", ieScale ? "0px" : top)
                .style("left", ieScale ? "0px" : left)
                .style("overflow", "hidden")
                .style("line-height", "normal")
                .style("margin", ieScale ? "0px" : styleMargin)
                .style("shape-rendering", shapeRendering);
            d3.select("#" + ID).append("svg:rect").attr("id", function() {
                return ID + "_rect";
            }).attr("x", function() {
                return (attrX + attrW) / 2;
            }).attr("y", function() {
                return (attrY + attrH) / 2;
            }).attr("width", 0).attr("height", 0).attr("rx", 15).attr("ry", 15).attr("fill-opacity", bOpacity).attr("fill", bColor);
            warp(ID + "_rect", attrW, attrH);
            //viewport = d3.select("#"+ID).append("g"); items in back

            //***Defs***
            //linear gradient red-blue
            var def = d3.select("#" + ID).append("svg:defs").attr("id", ID + "_extras");
            var gradient = def.append("linearGradient").attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%").attr("spreadMethod", "pad").attr("id", ID + "_linearGradient");
            gradient.append("stop").attr("stop-color", gradientColors[0]).attr("offset", "0%").attr("stop-opacity", 0.9);
            gradient.append("stop").attr("stop-color", gradientColors[0]).attr("offset", "20%").attr("stop-opacity", 0.2);
            gradient.append("stop").attr("stop-color", gradientColors[1]).attr("offset", "20%").attr("stop-opacity", 0.2);
            gradient.append("stop").attr("stop-color", gradientColors[1]).attr("offset", "80%").attr("stop-opacity", 0.9);
            gradient.append("stop").attr("stop-color", gradientColors[2]).attr("offset", "80%").attr("stop-opacity", 0.9);
            gradient.append("stop").attr("stop-color", gradientColors[2]).attr("offset", "100%").attr("stop-opacity", 0.2);
            //blur
            def.append("filter").attr("id", ID + "_blurFilter").attr("primitiveUnits", "objectBoundingBox").attr("x", -0.05).attr("y", -0.05).attr("width", 1.25).attr("height", 1.25).append("feGaussianBlur").attr("id", ID + "_gaussianBlur").attr("stdDeviation", "0").attr("in", "SourceGraphic");
            //clipPath for image
            def.append("clipPath").attr("id", ID + "_clipperImage").append("circle").attr("cx", 0).attr("cy", 0).attr("r", min(0.8 * 0.25 * attrW, 0.6 * 0.8 * attrH) / 2);
            def.append("clipPath").attr("id", ID + "_clipperRect").append("rect").attr("x", -50).attr("y", 0).attr("width", attrW * 0.75 + 50).attr("height", 0.2 * attrH).attr("rx", min(attrW, attrH) / 50).attr("ry", min(attrW, attrH) / 50);
            def.append("clipPath").attr("id", ID + "_clipperLeftPanel").append("rect").attr("x", 0).attr("y", 0).attr("width", attrW).attr("height", attrH).attr("rx", min(attrW, attrH) / 50).attr("ry", min(attrW, attrH) / 50);
            ordinalRect = d3.select("#" + ID + "_extras").append("clipPath").attr("id", ID + "_clipperOrdinalRect").append("rect").attr("x", 0).attr("y", 0).attr("width", 0).attr("height", 0.9 * attrH).attr("rx", min(attrW, attrH) / 30).attr("ry", min(attrW, attrH) / 30); //height is bit bigger to make bottom of the rects flat
            //neon
            var neon = def.append("filter").attr("id", "NeonGlow").attr("x", 0).attr("y", 0).attr("width", 1).attr("height", 1);
            neon.append("feColorMatrix").attr("in", "SourceGraphic").attr("type", "matrix").attr("values", "1 0 0 0 0.5, 0 1 0 0 0.5, 0 0 1 0 0.5, 0 0 0 16 -10").attr("result", "feColorMatrixOut");
            neon.append("feGaussianBlur").attr("in", "feColorMatrixOut").attr("stdDeviation", 0.5).attr("result", "feGaussianBlurOut");
            neon.append("feBlend").attr("in", "SourceGraphic").attr("in2", "feGaussianBlurOut").attr("result", "feBlendOut").attr("mode", "screen");
            //***Defs***

            viewportBackground = d3.select("#" + ID).append("g").attr("clip-path", "url(#" + ID + "_clipperLeftPanel" + ")");
            viewport = d3.select("#" + ID).append("g"); //items in here
            viewportOrdinal = viewport.append("g");
            viewportLinear = viewport.append("g");
            viewportFront = d3.select("#" + ID).append("g"); //overlay items here

            renderLeftPanel(viewportBackground, viewportBackground, viewportFront);
            renderScale(viewportBackground);

            return this;
        }

        var scaleMainBot;
        var axisMainBot;
        //resusable arrays for AA reference
        var AAColors = {
            R: "#8694fa",
            K: "#baaafc",
            E: "#f93333",
            D: "#fb7979",
            I: "#ffff4f",
            L: "#ffff79",
            V: "#ffffab",
            A: "#ffffc9",
            C: "#e3f9ad",
            H: "#d5f6fb",
            M: "#c3ed27",
            N: "#ee72a7",
            Q: "#f9c3e3",
            F: "#c7c88a",
            Y: "#7dafb9",
            W: "#85b0cd",
            S: "#ca9ec8",
            T: "#f0e4ef",
            G: "#c0c0c0",
            P: "#f1f2f3"
        };

        this.render = function(scale) {
            !this.loaded ? (this.loaded = true, handleEvent({
                linear: _input_.linear[linearID],
                ordinal: _input_.ordinal[ordinalID]
            }, "onload", null, true)) : void(0);
            var ordinalData = sortObject(_input_.ordinal[ordinalID].categories);
            var temporary = documentById(ID + "_temporary");
            temporary ? temporary.parentNode.removeChild(temporary) : void(0);
            viewportTemporary = viewportFront.append("g").attr("id", ID + "_temporary");
            gStackObj = {};
            gModeCondition = undefined;
            scaleInTransition = true;
            scaleTimeout ? clearTimeout(scaleTimeout) : void(0);
            scaleTimeout = setTimeout(function() {
                scaleInTransition = false;
                scaleTimeout = false;
            }, 1000);
            cleanHover();
            _this_.renderOrdinal(ordinalData, viewportOrdinal, scale);
            _this_.renderSolidCurve(ordinalData, viewportLinear, scale);
        }
        this.renderOrdinal = function(ordinalData, container, scale) {
            var width = 0.70 * attrW / Object.keys(_input_.ordinal[ordinalID].categories).length,
                cOrdinal = _input_.ordinal[ordinalID], //current ordinal
                cColors = cOrdinal.colors, //current colors
                cState = "colors" in cOrdinal, //current color state
                partition = cOrdinal.partition;
            ordinalRect.attr("width", width);
            //enter
            var selection = container.selectAll("." + ID + "_ordinalBoxes").data(ordinalData, function(d, i) {
                return d
            });
            selection
                .enter()
                .append("g")
                .style("opacity", 0)
                .attr("clip-path", "url(#" + ID + "_clipperOrdinalRect)")
                .attr("transform", function(d, i) {
                    return "translate(" + (0.25 * attrW + i * width) + "," + (0.10 * attrH) + ")"
                })
                .attr("class", ID + "_ordinalBoxes")
                .each(function(d, i) {
                    var thisG = d3.select(this);
                    //rectangles
                    thisG
                        .append("rect")
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("height", 0.10 * attrH)
                        .attr("stroke-width", 0)
                        .attr("fill", returnColor("ordinal", cState, undefined, cColors, undefined, i, d)) //necessary to prevent initially black curves during transition
                        .attr("fill-opacity", 0.8)
                        .attr("class", "main")
                        .property("__lexiconIndex__", i)
                        .style("cursor", "pointer");
                    //texts 
                    thisG
                        .append("text")
                        .text(d.length > 10 ? d.slice(0, 10) + ".." : d)
                        .attr("x", 0)
                        .attr("dx", width / 8)
                        .attr("y", 0)
                        .attr("dy", 0.05 * attrH)
                        .attr("font-family", "advent-pro")
                        .attr("font-weight", 800)
                        .attr("text-anchor", "start")
                        .attr("textLength", width * 0.75)
                        //.attr("lengthAdjust","spacing")
                        .attr("font-size", min(0.05 * attrH, width / 2))
                        .attr("fill", _tagColors_[1])
                        .attr("stroke-width", 0)
                        .style("cursor", "pointer");
                    if (!partition) {
                        return;
                    }
                    //partition
                    makePartition(thisG, d, i);
                })
                .transition("fadein")
                .style("opacity", 1)
                .delay(0)
                .duration(500);


            //update
            //g
            selection
                .on("touchstart", function(d, i) {
                    this.touchCount = this.touchCount === undefined ? 0 : ++this.touchCount % 2;
                    if (!this.touchCount) {
                        _this_.onpickStart(enableOnPick, d3.event, this, attrW, attrH, width, scaleInTransition, function() {
                            highlightSolidCurve(container, i, d, undefined).__lexiconExtend__()
                        }, handleEvent, _input_, linearID, d, i)
                    }
                })
                .on("touchend", function(d, i) {
                    if (this.touchCount) {
                        _this_.onpickEnd(enableOnPick, d3.event, this, attrW, attrH, width, scaleInTransition, function() {
                            highlightSolidCurve(container, i, d, undefined).__lexiconShrink__()
                        }, handleEvent, _input_, linearID, d, i)
                    }
                    d3.event.preventDefault(); //do not need rest of mouse events if touch is supported
                })
                .on("mouseenter", function(d, i) {
                    _this_.onpickStart(enableOnPick, d3.event, this, attrW, attrH, width, scaleInTransition, function() {
                        highlightSolidCurve(container, i, d, undefined).__lexiconExtend__()
                    }, handleEvent, _input_, linearID, d, i)
                })
                .on("mouseleave", function(d, i) {
                    _this_.onpickEnd(enableOnPick, d3.event, this, attrW, attrH, width, scaleInTransition, function() {
                        highlightSolidCurve(container, i, d, undefined).__lexiconShrink__()
                    }, handleEvent, _input_, linearID, d, i)
                })
                .transition()
                .attr("transform", function(d, i) {
                    return "translate(" + (0.25 * attrW + i * width) + "," + (0.10 * attrH) + ")"
                })
                .delay(0)
                .duration(500);
            //rect
            selection
                .selectAll("rect.main")
                .transition()
                .attr("fill", function(d, i) {
                    return returnColor("ordinal", cState, undefined, cColors, undefined, this.__lexiconIndex__, d)
                })
                .attr("width", width)
                .delay(0)
                .duration(500);
            //text
            selection
                .selectAll("text")
                .transition()
                .attr("fill-opacity", 0)
                .delay(0)
                .duration(125)
                .transition()
                .text(function(d, i) {
                    return d.length > 10 ? d.slice(0, 10) + ".." : d;
                })
                .transition()
                .attr("fill-opacity", 1)
                .attr("dx", width / 8)
                .attr("textLength", width * 0.75)
                .duration(125);
            //partition
            var partitions = selection.selectAll("rect.partition");
            switch (+!!partitions.node() + (2 * +!!partition)) {
                case 0:
                    void(0);
                    break;
                case 1:
                    partitions
                        .classed("partition", false)
                        .transition("fadeout")
                        .style("opacity", 0)
                        .each("end", function() {
                            d3.select(this).remove();
                        })
                        .delay(0)
                        .duration(750);
                    break;
                case 2:
                    selection.each(function(d, i) {
                        makePartition(d3.select(this), d, i)
                            .transition("fadein")
                            .attr("width", width)
                            .attr("fill-opacity", 0.6)
                            .delay(0)
                            .duration(500);
                    })
                    break;
                case 3:
                    selection.each(function(d, i) {
                        var partitionNode = this.querySelector(".partition");
                        if (partitionNode) {
                            partitionNode.__lexiconIndex__ = i;
                        } else {
                            makePartition(d3.select(this), d, i);
                        }
                    });
                    selection.selectAll("rect.partition")
                        .transition()
                        .attr("fill", function(d) {
                            return returnColor("partition", partition === "color" ? cState : false, undefined, cColors, undefined, this.__lexiconIndex__, d)
                        })
                        .attr("width", width)
                        .attr("fill-opacity", 0.6)
                        .delay(0)
                        .duration(500);
                    break;
            }
            //exit
            selection
                .exit()
                .classed(ID + "_ordinalBoxes", false)
                .transition("remove")
                .style("opacity", 0)
                .each("end", function() {
                    d3.select(this).remove()
                })
                .delay(0)
                .duration(750);

            function makePartition(thisG, d, i) {
                return thisG
                    .append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("transform", "translate(0," + (0.10 * attrH) + ")")
                    .attr("height", 0.60 * attrH)
                    .attr("width", 0)
                    .attr("stroke-width", 0)
                    .property("__lexiconIndex__", i)
                    .attr("fill", returnColor("partition", partition === "color" ? cState : false, undefined, cColors, undefined, i, d)) //necessary to prevent initially black curves during transition
                    .attr("fill-opacity", 0)
                    .attr("class", "partition")
                    .style("cursor", "pointer");
            }
        }
        this.renderSolidCurve = function(ordinalData, container, scale) {
            var selection = container.selectAll("." + ID + "_ordinalSolidCurves").data(ordinalData, function(d, i) {
                    return d
                }),
                cOrdinal = _input_.ordinal[ordinalID], //current ordinal
                cColors = cOrdinal.colors, //current colors
                cState = "colors" in cOrdinal, //current color state
                cOrdinalModeValue = cOrdinal.mode,
                cOrdinalMode = !!cOrdinal.mode,
                /* Modify#1 taken from renderCurves */
                linear$ID$ = _input_.linear[linearID],
                mode = linear$ID$.mode,
                doExistMode = !!mode,
                sort = linear$ID$.sort,
                doExistSort = !!sort,
                offset = doExistMode ? typeof mode === "object" ? mode[1] : 0 : undefined,
                mode = doExistMode ? typeof mode === "object" ? mode[0] : mode : undefined,
                /* Modify#1 taken from renderCurves */
                gMode = linear$ID$.gMode,
                gModeBool = !!gMode,
                gStackContext = 0;
            gModeCondition = +gModeBool + ((gMode === "justify") << 1) + (doExistMode << 2);
            var scaleStep = undefined;
            gMode === "justify" ?
                (scale = linear$ID$.domain.map(function(d, i, a) {
                        return i === 0 ? d : a[i - 1] + ordinalData.length * abs(d - a[i - 1])
                    }),
                    scaleStep = abs(scale[0] - scale[1]) / ordinalData.length,
                    _this_.changeScale(scale, linear$ID$.format)) :
                void(0);
            //enter
            selection
                .enter()
                .append("g")
                .style("opacity", 0)
                .attr("class", ID + "_ordinalSolidCurves")
                .transition()
                .style("opacity", 1)
                .delay(0)
                .duration(500);
            //update
            selection
                .each(function(d, i) {
                    if (!_input_.linear[linearID].categories[d]) {
                        d3.select(this).selectAll("path").attr("toBeRemoved", "").transition().attr("fill-opacity", 0).delay(0).duration(750).remove();
                        return;
                    }
                    renderCurves.bind(this, d, i)();
                })
            //exit
            selection
                .exit()
                .classed(ID + "_ordinalSolidCurves", false)
                .transition("remove")
                .style("opacity", 0)
                .each("end", function() {
                    d3.select(this).remove()
                })
                .delay(0)
                .duration(750);

            for (var u = container.node().querySelectorAll("." + ID + "_ordinalSolidCurves"), j = 0, k = u.length; j < k; ++j) {
                if (u[j].querySelectorAll("path:not([toBeRemoved])").length !== 0) {
                    return
                }
            }
            handleEvent(null, "onmismatch", null, true);


            function renderCurves(d, i) {
                var refPath = undefined,
                    isRef = undefined,
                    indexPlaceHolder = {},
                    /* Modify#1 removed some decleration up one scope*/
                    categories$d$ = linear$ID$.categories[d],
                    categories$d$names = categories$d$.names,
                    doExistNames = !!categories$d$names,
                    categories$d$intervals = categories$d$.intervals,
                    categories$d$intervals = categories$d$intervals ? categories$d$intervals : (isRef = true, refPath = _input_.linear[+categories$d$].categories[d], refPath.intervals),
                    names = doExistNames ?
                    typeof categories$d$names === "string" ? [categories$d$names] : categories$d$names :
                    isRef ? typeof refPath.names === "string" ? [refPath.names] : refPath.names :
                    undefined,
                    namesBool = !!names,
                    isObjIntervals = typeof categories$d$intervals === "object",
                    intervals = isObjIntervals ? categories$d$intervals.slice() : [categories$d$intervals],
                    intervals = coerceToNumber(intervals), //coerce all to number
                    intervals = doExistSort ? sortInterval(sort, indexPlaceHolder, names, intervals) : intervals,
                    isObjColors = cState ? typeof cColors[d] === "object" : false,
                    colorsLength = isObjColors ? cColors[d].length : undefined,
                    stackingContext = intervals.map(function(d, i, a) {
                        var x = a.slice(0, i).reduce(function(ac, d, i, a) {
                            return typeof d === "object" ? ac + (d[1] - d[0]) : ac + d
                        }, 0);
                        return [x, typeof d === "object" ? x + (d[1] - d[0]) : x + d]
                    }),
                    stackingContextLength = stackingContext.length,
                    stackingSpan = stackingContext[stackingContext.length - 1][1],
                    stackingStep = stackingSpan / stackingContextLength,
                    stackingContextOrdinal = cOrdinalModeValue === "stackEqual" ? stackingContext.map(function(d, i) {
                        return [i * stackingStep, (i + 1) * stackingStep]
                    }) : restackOrdinal(stackingContext, stackingStep, stackingSpan),
                    stackingContextLinear = mode === "intervalize" ? intervals.map(function(d, i, a) {
                        return [0, typeof d === "object" ? (d[1] - d[0]) : d]
                    }) : stackingContext,
                    stackingSpanLinear = mode === "intervalize" ? max.apply(this, Array.prototype.concat.apply([], stackingContextLinear).map(function(d) {
                        return +d
                    })) : stackingSpan;
                doExistMode ? offset ? intervals = stackingContextLinear.map(function(d, i) {
                    return [d[0] + offset + gStackContext, d[1] + offset + gStackContext]
                }) : intervals = stackingContextLinear.map(function(d, i) {
                    return [d[0] + gStackContext, d[1] + gStackContext]
                }) : void(0);

                switch (gModeCondition) {
                    case 0: //no gMode,
                        void(0);
                        break;
                    case 1: //gMode, stack, no mode,
                        gStackObj[d] = gStackContext;
                        gStackContext += max.apply(this, Array.prototype.concat.apply([], intervals).map(function(d) {
                            return +d
                        }));
                        intervals = intervals.map(function(u, w) {
                            return typeof u === "object" ? [u[0] + gStackObj[d], u[1] + gStackObj[d]] : u + gStackObj[d]
                        });
                        break;
                    case 5: //gMode, stack, mode,
                        gStackObj[d] = gStackContext;
                        gStackContext += stackingSpanLinear;
                        break;
                    case 3: //gMode, justify, no mode,
                        gStackObj[d] = gStackContext;
                        gStackContext += scaleStep;
                        intervals = intervals.map(function(u, w) {
                            return typeof u === "object" ? [u[0] + gStackObj[d], u[1] + gStackObj[d]] : u + gStackObj[d]
                        });
                        break;
                    case 7: //gMode, justify, mode,
                        gStackObj[d] = gStackContext;
                        gStackContext += scaleStep;
                        break;
                }


                //var	selection = d3.select(this).selectAll("path").data(intervals);
                var selection = d3.select(this).selectAll("path:not([toBeRemoved])." + ID + "_entered").data(intervals, function(dd, ii) {
                    var isEl = "nodeType" in this;
                    var key = isEl ? this.__keyLexicon : undefined;
                    var nKey;
                    switch ((+(namesBool) + (doExistSort)) * +(namesBool)) {
                        case 2:
                            if (key && isEl) {
                                return key
                            } else {
                                nKey = names ? names[indexPlaceHolder[ii]] || ii : ii
                                isEl ? this.__keyLexicon = nKey : void(0);
                                return nKey;
                            }
                        case 1:
                            if (key && isEl) {
                                return key
                            } else {
                                nKey = names ? names[ii] || ii : ii;
                                isEl ? this.__keyLexicon = nKey : void(0);
                                return nKey;
                            }
                        case 0:
                            isEl ? delete this.__keyLexicon : void(0);
                            return ii;
                        default:
                            isEl ? delete this.__keyLexicon : void(0);
                            return ii;
                    }
                });
                //enter
                selection
                    .enter()
                    .append("path")
                    .attr("class", ID + "_entered")
                    .attr("fill", function(dd, ii) {
                        return returnColor("linear", cState, isObjColors, cColors, colorsLength, i, d, ii, dd)
                    }) //necessary to prevent initially black curves during transition
                    .attr("fill-opacity", 0)
                //update
                selection
                    .order()
                    .on("mouseover", function(dd, ii) {
                        cleanHover();
                        var clonedNode = currentHovered = this.cloneNode(false); //attributes are already taken deep is for children
                        clonedNode.removeAttribute("class");
                        clonedNode.setAttribute("id", ID + "_hovered");
                        clonedNode.setAttribute("stroke-width", 2);
                        clonedNode.setAttribute("stroke", returnColor("stroke", cState, isObjColors, cColors, colorsLength, i, d, ii, dd));
                        clonedNode.setAttribute("filter", "url(#NeonGlow)");
                        clonedNode.gesture = function(event) {
                            event.preventDefault();
                            event.stopPropagation();
                            cleanHover();
                            handleEvent({
                                name: names ? isRef && doExistSort ? names[indexPlaceHolder[ii]] : names[ii] : names,
                                item: dd,
                                parent: categories$d$,
                                index: isObjIntervals ? ii : undefined
                            }, "onhighlight", event.type, false);
                        };
                        clonedNode.addEventListener("mouseout", clonedNode.gesture, false);
                        clonedNode.addEventListener("touchend", clonedNode.gesture, false);
                        this.parentNode.appendChild(clonedNode);
                        handleEvent({
                            name: names ? isRef && doExistSort ? names[indexPlaceHolder[ii]] : names[ii] : names,
                            item: dd,
                            parent: categories$d$,
                            index: isObjIntervals ? ii : undefined
                        }, "onhighlight", /*d3.event.type*/ "mouseover", true);
                    })
                    .on("touchstart", function(dd, ii) {
                        d3.select(this).on("mouseover").bind(this, dd, ii)();
                    })
                    .on("touchend", function() {
                        d3.event.preventDefault();
                    })
                    /*.on("touchcancel",function(){
                    	//d3.event.preventDefault();
                    })
                    .on("mouseout",function(dd,ii){
                    	//d3.event.relatedTarget === currentHovered ? void(0) : cleanHover();
                    	//handleEvent({name: names ? isRef && doExistSort ? names[indexPlaceHolder[ii]] : names[ii] : names,item:dd,parent:categories$d$,index: isObjIntervals ? ii : undefined},"onhighlight",d3.event.type);
                    })*/
                    .transition("fadeInOut")
                    .attr("d", function(dd, ii) {
                        return drawSolidCurve(i, dd, undefined, scale, (cOrdinalMode ? stackingContextOrdinal[ii] : undefined), stackingSpan)
                    })
                    .attr("fill", function(dd, ii) {
                        return returnColor("linear", cState, isObjColors, cColors, colorsLength, i, d, ii, dd)
                    })
                    .attr("fill-opacity", 0.8)
                    .delay(0)
                    .duration(500);
                //exit
                selection
                    .exit()
                    .classed(ID + "_entered", false)
                    .transition("fadeInOut")
                    .attr("fill-opacity", 0)
                    .each("end", function() {
                        d3.select(this).remove()
                    })
                    .delay(0)
                    .duration(750);
            }
        }

        //left panel
        function renderLeftPanel(containerOrdinal, containerLinear, containerImage) {
            function getIndexOf(node) {
                node = node.node();
                var length = node.parentNode.childNodes.length;
                for (var pNode = node.parentNode, cNodes = pNode.childNodes, i = 0; i < length; ++i) {
                    if (cNodes[i] === node) {
                        break;
                    }
                }
                return i;
            }

            function containerWithSmallestIndex() {
                var args = Array.prototype.slice.call(arguments);
                var base = args.length;
                return args.map(function(d, i) {
                    return [d, getIndexOf(d), i]
                }).sort(function(a, b) {
                    return a[1] * base + a[2] - b[1] * base - b[2]
                })[0][0];
            }
            var obj = {
                subject: undefined,
                dim: function() {
                    this.subject.transition().attr("fill-opacity", 0.9).delay(0).duration(1000);
                    if (this.hasImage()) {
                        this.subject.selectAll("image").transition().style("opacity", 1).delay(0).duration(1000)
                    }
                },
                undim: function() {
                    this.subject.transition().attr("fill-opacity", 0.8).delay(0).duration(1000);
                    if (this.hasImage()) {
                        this.subject.selectAll("image").transition().style("opacity", 0.6).delay(0).duration(1000)
                    }
                },
                hasImage: function() {
                    return Array.prototype.some.call(this.subject.node().childNodes, function(d, i) {
                        return d.nodeName.match(/image/gi)
                    })
                },
                hasText: function() {
                    return Array.prototype.some.call(this.subject.node().childNodes, function(d, i) {
                        return d.nodeName.match(/text/gi)
                    })
                },
                changeImage: function() {
                    /*TODO: empty string is valid URI reference, but there is a risk browser request
                    javascript:void(0) doesnt work in chrome, it is replaced by default placeholder*/
                    if (!this.hasImage()) {
                        return;
                    }
                    var selection = this.subject.select("image");
                    if (selection.attr("xlink:href") === (_input_.linear[linearID].glyph || "")) {
                        return;
                    }
                    selection.transition("changeImage")
                        .each("end", function() {
                            selection.attr("xlink:href", _input_.linear[linearID].glyph || "")
                        })
                        .style("opacity", 0).delay(0).duration(250)
                        .transition().style("opacity", 0.7).duration(250);
                },
                changeText: function(nText) {
                    if (!this.hasText()) {
                        return;
                    }
                    this.subject.select("text").transition("changeText").each("end", function() {
                            d3.select(this).text(nText)
                        }).attr("fill-opacity", 0).delay(0).duration(250)
                        .transition().attr("fill-opacity", 0.6).duration(250);
                },
            };
            //containerWithSmallestIndex.apply(_this_,Array.prototype.slice.call(arguments)).append("rect").classed("GUI",true).attr("x",0).attr("y",0).attr("width",attrW*0.25).attr("height",attrH).attr("fill","url(#"+ID+"_linearGradient)").attr("fill-opacity",0.6);
            var topRightRect = containerOrdinal.append("rect").classed("GUI", true).attr("x", 0).attr("y", 0).attr("width", attrW * 0.75).attr("height", 0.2 * attrH).attr("fill", guiColor).attr("fill-opacity", guiIsOn ? 0.8 : 0).style("visibility", guiIsOn ? "visible" : "hidden").attr("transform", "translate(" + (0.25 * attrW) + "," + (0) + ")").attr("clip-path", "url(#" + ID + "_clipperRect)").node();
            var botRightRect = containerLinear.append("rect").classed("GUI", true).attr("x", 0).attr("y", 0).attr("width", attrW * 0.75).attr("height", 0.2 * attrH).attr("fill", guiColor).attr("fill-opacity", guiIsOn ? 0.8 : 0).style("visibility", guiIsOn ? "visible" : "hidden").attr("transform", "translate(" + (0.25 * attrW) + "," + (0.8 * attrH) + ")").attr("clip-path", "url(#" + ID + "_clipperRect)").node();
            //topRightRect.parentNode.insertBefore((function(o){o.setAttribute("fill","url(#"+ID+"_linearGradient)");return o})(topRightRect.cloneNode()),topRightRect);
            //botRightRect.parentNode.insertBefore((function(o){o.setAttribute("fill","url(#"+ID+"_linearGradient)");return o})(botRightRect.cloneNode()),botRightRect);
            var ordinalG = containerOrdinal.append("g").classed("GUI", true).attr("fill-opacity", guiIsOn ? 0.8 : 0).style("visibility", guiIsOn ? "visible" : "hidden");
            var linearG = containerLinear.append("g").classed("GUI", true).attr("fill-opacity", guiIsOn ? 0.8 : 0).style("visibility", guiIsOn ? "visible" : "hidden");
            var imageG = containerImage.append("g").classed("GUI", true).attr("fill-opacity", guiIsOn ? 0.8 : 0).style("visibility", guiIsOn ? "visible" : "hidden");
            _this_.ordinalG = function() {
                return ordinalG
            };
            _this_.ordinalG.update = function(count) {
                ordinalID = count;
                _this_.ordinalG.changeText(_input_.ordinal[ordinalID].name);
                _this_.render();
            }
            _this_.ordinalG.counter = function() {
                return ordinalID
            }
            _this_.linearG = function() {
                return linearG
            };
            _this_.linearG.update = function(count) {
                linearID = count;
                _this_.imageG.changeImage(_input_.linear[linearID].glyph);
                _this_.linearG.changeText(_input_.linear[linearID].name);
                _this_.changeScale(_input_.linear[linearID].domain, _input_.linear[linearID].format);
                _this_.render(_input_.linear[linearID].domain);
            }
            _this_.linearG.counter = function() {
                return linearID
            }
            _this_.imageG = function() {
                return imageG
            };
            createInstance(_this_.ordinalG, ordinalG);
            createInstance(_this_.linearG, linearG);
            createInstance(_this_.imageG, imageG);
            ordinalG.append("rect").classed("GUI", true).attr("x", 0).attr("y", 0).attr("width", attrW * 0.25).attr("height", attrH * 0.2).attr("fill", guiColor);
            linearG.append("rect").classed("GUI", true).attr("x", 0).attr("y", 0.8 * attrH).attr("width", attrW * 0.25).attr("height", attrH * 0.2).attr("fill", guiColor);
            imageG.append("rect").classed("GUI", true).attr("x", 0).attr("y", 0.2 * attrH).attr("width", attrW * 0.25).attr("height", attrH * 0.6).attr("fill", guiColor);
            ordinalG.append("text").text(_input_.ordinal[0].name).attr("x", 0).attr("dx", 0.125 * attrW).attr("y", 0).attr("dy", 0.15 * attrH).attr("font-family", "advent-pro").attr("font-weight", 300).attr("text-anchor", "middle").attr("font-size", 0.2 * attrH * 0.4).attr("fill", _tagColors_[1]).attr("stroke", _tagColors_[1]).attr("stroke-width", 0).style("cursor", "pointer");
            linearG.append("text").text(_input_.linear[0].name).attr("x", 0).attr("dx", 0.125 * attrW).attr("y", 0.8 * attrH).attr("dy", 0.15 * attrH).attr("font-family", "advent-pro").attr("font-weight", 300).attr("text-anchor", "middle").attr("font-size", 0.2 * attrH * 0.4).attr("fill", _tagColors_[1]).attr("stroke", _tagColors_[1]).attr("stroke-width", 0).style("cursor", "pointer");
            imageG.append("image").attr("xlink:href", _input_.linear[0].glyph).attr("alt", "droplet").attr("x", -0.4 * 0.25 * attrW).attr("y", -0.4 * 0.6 * attrH).attr("height", 0.8 * 0.6 * attrH).attr("width", 0.8 * 0.25 * attrW).style("opacity", 0.7).attr("clip-path", "url(#" + ID + "_clipperImage)").attr("transform", "translate(" + (0.5 * 0.25 * attrW) + "," + (0.5 * 0.6 * attrH + 0.2 * attrH) + ")");
            //slider
            var slider = imageG.append("g").attr("transform", "translate(0," + attrH * 0.2 + ")");
            slider.node().ordinal = Array.prototype.concat.call(["__mock__", "__mock__"], _input_.ordinal.map(function(d, i) {
                return d.name
            }), ["__mock__", "__mock__"]);
            slider.node().linear = Array.prototype.concat.call(["__mock__", "__mock__"], _input_.linear.map(function(d, i) {
                return d.name
            }), ["__mock__", "__mock__"]);
            slider.node().__on__ = 0;
            slider.node().__ready__ = true;
            slider.node().render = function(type, count, offset) {
                if (!this.__ready__) {
                    return
                }
                var that = this;
                window.requestAnimationFrame(function() {
                    that.__type__ = type;
                    count = count || 0;
                    offset = offset || 0;
                    var current = max(0, min(_input_[type].length - 1, round(count + offset)));
                    var length = _input_[type].length + 4;
                    var countMax = max(1, length - 5); //prevent division by 0
                    if (!that.__on__) {
                        imageG.select("image").attr("filter", "url(#" + ID + "_blurFilter)").transition("blur").tween("blur", function() {
                            var interpolator = d3.interpolate(0, glyphBlurStd);
                            return function(t) {
                                document.getElementById(ID + "_gaussianBlur").setAttribute("stdDeviation", interpolator(t))
                            }
                        }).delay(0).duration(1500);
                        var rect = slider.append("rect").attr("fill", "LightGray").attr("width", attrW * 0.01).attr("height", function() {
                            this.__knobLengthReal__ = attrH * 0.6 * 5 / length;
                            this.__knobLength__ = max(this.__knobLengthReal__, attrH * 0.03);
                            this.__knobLengthSurplus__ = this.__knobLength__ - this.__knobLengthReal__;
                            this.__yMax__ = attrH * 0.6 - this.__knobLength__;
                            return this.__knobLength__
                        }).attr("rx", attrW * 0.005).attr("ry", attrW * 0.005).attr("x", attrW * 0.24).attr("y", function() {
                            return (count + offset) / countMax * this.__yMax__
                        });
                        //rect.__date__ = undefined;
                        rect.node().__count___ = undefined;
                        rect.node().__dCount__ = undefined;
                        rect.node().__timer__ = new(function(arg) {
                            this.parent = rect.node();
                            this.startTime = undefined;
                            this.elapsed = undefined;
                            this.dragEnded = true;
                            this.dragStarted = function() {
                                this.dragEnded = false;

                                function keepTime(timeStamp) {
                                    if (this.dragEnded) {
                                        this.startTime = undefined;
                                        return;
                                    }
                                    if (!this.startTime) {
                                        this.startTime = timeStamp;
                                    }
                                    this.elapsed = timeStamp - this.startTime;
                                    this.elapsed >= 350 ? this.parent.__dCount__ = 0 : void(0);
                                    window.requestAnimationFrame(keepTime.bind(this));
                                }
                                window.requestAnimationFrame(keepTime.bind(this));
                            }
                        });

                        var drag = d3.behavior.drag().origin(function() {
                            var x = +d3.select(this).attr("x");
                            var y = +d3.select(this).attr("y");
                            return {
                                "x": x,
                                "y": y
                            };
                        }).on("drag", dragFunc).on("dragstart", function() {
                            this.__count__ = this.__count__ || count;
                            this.__dCount__ = 0;
                            this.__timer__.dragStarted();
                            d3.event.sourceEvent.stopPropagation();
                        }).on("dragend", dragEnd);

                        function dragFunc() {
                            var pos = max(0, min(this.__yMax__, d3.event.y));
                            var rawCount = pos / this.__yMax__ * (this.__yMax__ + this.__knobLengthSurplus__) / (attrH * 0.6) * length || 0; //when this.__yMax__ is 0, that when there is only 1 item __count__ and __dCount__ will become NaN because of division by 0, logical or necessary
                            var count = floor(rawCount);
                            var offset = rawCount - count;
                            this.__timer__.elapsed >= 350 ? (this.__count__ = count, this.__timer__.startTime = undefined) : void(0);
                            this.__dCount__ = count - this.__count__;
                            d3.select(this).attr("y", pos);
                            slider.node().render(type, count, offset);
                            //console.log("count:"+count+","+"this.count:"+this.__count__+",this.dCount:"+this.__dCount__+",elapsed:"+elapsed);
                        }

                        function dragEnd() {
                            this.__timer__.dragEnded = true;
                            if (abs(this.__dCount__) <= 2) {
                                return
                            }
                            d3.select(this).transition().ease("cubic-out").tween("friction", function() {
                                    //var interpolator = d3.interpolate(this.__count__+this.__dCount__,this.__count__+this.__dCount__+Math.floor(this.__dCount__/2));
                                    var interpolator = d3.interpolate(this.__count__ + this.__dCount__, this.__count__ + this.__dCount__ * 2);
                                    return function(t) {
                                        var real = interpolator(t);
                                        var whole = floor(real);
                                        this.setAttribute("y", max(0, min(this.__yMax__, real / countMax * this.__yMax__)));
                                        this.__count__ = max(0, min(whole, length - 5));
                                        slider.node().render(type, this.__count__, real - whole);
                                    }
                                })
                                /*.each("end",function(){this.__count__ = this.__count__+this.__dCount__+Math.floor(this.__dCount__/3)})*/
                                .delay(0).duration(500);
                        }
                        rect.on("touchmove", function() {
                            disableScroll(this)
                        }).on("touchend", function() {
                            enableScroll(this)
                        }).call(drag);
                        that.__on__ = 1;
                    }
                    var selection = slider.selectAll("." + ID + "_sliderTexts").data(that[type].slice(count, count + 5));
                    selection
                        .enter()
                        .append("text")
                        .attr("font-family", "advent-pro")
                        .attr("font-weight", 300)
                        .attr("text-anchor", "middle")
                        .attr("class", ID + "_sliderTexts")
                        .style("cursor", "pointer");
                    selection
                        .text(function(d, i) {
                            return d === "__mock__" ? "" : d
                        })
                        .attr("fill", function(d, i) { /*console.log("i:"+i+",offset:"+offset+",current:"+current+",count:"+count);*/
                            var corrected = offset !== 0.5 ? round(i - offset) : floor(i - offset);
                            return corrected !== 2 ? "AntiqueWhite" : "Red"
                        })
                        .attr("fill-opacity", function(d, i) {
                            return 1 - 0.4 * abs(2 - i + offset)
                        })
                        .attr("transform", function(d, i) {
                            return "translate(" + (0.125 * attrW) + "," + ((i + 1 - offset) * attrH * 0.12) + ") scale(1," + (1 - 0.4 * abs(2 - i + offset)) + ")"
                        });
                    selection
                        .exit()
                        .remove();
                    _this_[type + "G"].counter() !== current ? _this_.update(type, current) : void(0);

                    that.__ready__ = true;
                })
                this.__ready__ = false;
            }
            slider.node().remove = function() {
                this.__on__ = 0;
                imageG.select("image").attr("filter", "url(#" + ID + "_blurFilter)").transition("blur").tween("blur", function() {
                        var interpolator = d3.interpolate(glyphBlurStd, 0);
                        return function(t) {
                            document.getElementById(ID + "_gaussianBlur").setAttribute("stdDeviation", interpolator(t))
                        }
                    })
                    .each("end", function() { /*console.log(this);*/
                        d3.select(this).attr("filter", "none")
                    }).delay(0).duration(1500);
                slider.select("rect").remove();
                slider.selectAll("." + ID + "_sliderTexts").classed(ID + "_sliderTexts", false)
                    .transition()
                    .attr("fill-opacity", 0)
                    .each("end", function() {
                        d3.select(this).remove()
                    })
                    .delay(0).duration(500);
            }
            slider.on("touchmove", function() {
                disableScroll(this)
            }).on("touchend", function() {
                enableScroll(this)
            });
            d3.behavior.drag()
                .on("dragstart", function() {
                    d3.event.sourceEvent.stopPropagation();
                    var rect = this.querySelector("rect");
                    var length = this.__length__ = _input_[this.__type__].length + 4;
                    var yMax = this.__yMax__ = rect.__yMax__;
                    var knobLengthSurplus = this.__knobLengthSurplus__ = rect.__knobLengthSurplus__;
                    this.__rawCount__ = (+rect.getAttribute("y")) / yMax * (yMax + knobLengthSurplus) / (attrH * 0.6) * length || 0;
                })
                .on("drag", function dragFunc() {
                    this.__rawCount__ = max(0, min(this.__rawCount__ += d3.event.dy / attrH / 0.12, this.__length__ - 5));
                    var pos = this.__rawCount__ * (attrH * 0.6) * this.__yMax__ / this.__length__ / (this.__yMax__ + this.__knobLengthSurplus__) || 0;
                    var count = floor(this.__rawCount__);
                    var offset = this.__rawCount__ - count;
                    this.querySelector("rect").setAttribute("y", pos);
                    this.render(this.__type__, count, offset);
                })
                .on("dragend", function dragEnd() {
                    this.__length__ = undefined;
                    this.__yMax__ = undefined;
                    this.__knobLengthSurplus__ = undefined;
                    this.__rawCount__ = undefined;
                }).bind(slider)();

            //slider

            //attach event handlers
            ordinalG
                .on("mouseover", function() {
                    if (!guiIsOn) {
                        return
                    }
                    _this_.ordinalG.dim();
                })
                .on("mouseout", function() {
                    if (!guiIsOn) {
                        return
                    }
                    _this_.ordinalG.undim();
                })
                .on("click", function() {
                    if (!guiIsOn) {
                        return
                    }
                    if (slider.node().__on__ && slider.node().__type__ === "ordinal") {
                        slider.node().remove();
                    } else if (slider.node().__on__) {
                        slider.node().remove();
                        slider.node().render("ordinal", ordinalID);
                    } else {
                        slider.node().render("ordinal", ordinalID);
                    }
                });
            linearG
                .on("mouseover", function() {
                    if (!guiIsOn) {
                        return
                    }
                    _this_.linearG.dim();
                })
                .on("mouseout", function() {
                    if (!guiIsOn) {
                        return
                    }
                    _this_.linearG.undim();
                })
                .on("click", function() {
                    if (!guiIsOn) {
                        return
                    }
                    if (slider.node().__on__ && slider.node().__type__ === "linear") {
                        slider.node().remove();
                    } else if (slider.node().__on__) {
                        slider.node().remove();
                        slider.node().render("linear", linearID);
                    } else {
                        slider.node().render("linear", linearID);
                    }
                });
            imageG
                .on("mouseover", function() {
                    if (!guiIsOn) {
                        return
                    }
                    _this_.imageG.dim();
                })
                .on("mouseout", function() {
                    if (!guiIsOn) {
                        return
                    }
                    _this_.imageG.undim();
                })
            //attach event handlers
            function createInstance(instance, subject) {
                for (var i in obj) {
                    if (i !== "subject") {
                        instance[i] = obj[i];
                    }
                }
                instance.subject = subject;
            }
        }

        function renderScale(container) {
            //##############################################################SCALE###################################################################################
            scaleMainBot = d3.scale.linear().domain(_input_.linear[0].domain).range([0, 0.70 * attrW]);
            axisMainBot = d3.svg.axis().scale(scaleMainBot).orient("bottom").ticks(5).tickSize(-0.025 * attrH, 0).tickPadding(6).tickFormat(d3.format(_input_.linear[0].format || null));

            var axisG = container.append("g").attr("id", ID + "_lexMainAxisBot").attr("class", "global_lexMainAxes").attr("class", "global_lexScaleAxes").attr("transform", "translate(" + (0.25 * attrW) + "," + (0.8 * attrH + 2.75) + ")").call(axisMainBot);
            //##############################################################SCALE###################################################################################
            _this_.changeScale = function(domain, format) {
                format = format || null;
                axisMainBot.tickFormat(d3.format(format));
                container.select("#" + ID + "_lexMainAxisBot").transition()
                    .tween("scaleChange", function() {
                        var interpolator = d3.interpolateArray(scaleMainBot.domain(), domain);
                        return function(t) {
                            scaleMainBot.domain(interpolator(t));
                            axisG.call(axisMainBot);
                        }
                    })
                    .each("end", function() {
                        var axis = _input_.linear[linearID].axis;
                        axis !== undefined ? _this_.toggleAxis(axis) : _this_.toggleAxis(true);
                    })
                    .delay(0).duration(1000);
            }
        }

        function drawSolidCurve(order, domain, side, scale, stackingContext, stackingSpan) {
            stackingSpan = stackingSpan || 1;
            var currentScale = scale ? d3.scale.linear().domain(scale).range([0, 0.70 * attrW]) : scaleMainBot;
            var epsilon = dispersion * attrW;
            var delta = 0.1 * 0.6 * attrH;
            var offset = 0.25 * attrW;
            var length = Object.keys(_input_.ordinal[ordinalID].categories).length;
            var tabLength = attrW * 0.70 / length;
            var start1 = stackingContext ? [tabLength * (order + stackingContext[0] / stackingSpan) + offset, 0.2 * attrH] : [order * tabLength + offset, 0.2 * attrH];
            var start2 = stackingContext ? [tabLength * (order + stackingContext[1] / stackingSpan) + offset, 0.2 * attrH] : [(order + 1) * tabLength + offset, 0.2 * attrH];
            var end1 = [typeof domain === "object" ? currentScale(+domain[0]) + offset : currentScale(+domain) + offset - epsilon, 0.8 * attrH];
            var end2 = [typeof domain === "object" ? currentScale(+domain[1]) + offset : currentScale(+domain) + offset + epsilon, 0.8 * attrH];
            if (arguments[2] === undefined) {
                return basis([
                        [start1[0], start1[1]],
                        [start1[0], start1[1] + delta],
                        [start1[0] * 0.75 + 0.25 * end1[0], attrH * 0.5],
                        [end1[0], end1[1] - delta],
                        [end1[0], end1[1]]
                    ]) +
                    "L" + line([
                        [end1[0], end1[1]],
                        [end2[0], end2[1]]
                    ]).slice(1) +
                    "L" + (basis([
                        [end2[0], end2[1]],
                        [end2[0], end2[1] - delta],
                        [start2[0] * 0.75 + 0.25 * end2[0], attrH * 0.5],
                        [start2[0], start2[1] + delta],
                        [start2[0], start2[1]]
                    ])).slice(1) +
                    "Z";
            } else if (arguments[2] === "left") {
                return basis([
                    [start1[0], start1[1]],
                    [start1[0], start1[1] + delta],
                    [start1[0] * 0.75 + 0.25 * end1[0], attrH * 0.5],
                    [end1[0], end1[1] - delta],
                    [end1[0], end1[1]]
                ]);
            } else if (arguments[2] === "right") {
                return basis([
                    [end2[0], end2[1]],
                    [end2[0], end2[1] - delta],
                    [start2[0] * 0.75 + 0.25 * end2[0], attrH * 0.5],
                    [start2[0], start2[1] + delta],
                    [start2[0], start2[1]]
                ].reverse());
            }
        }

        function highlightSolidCurve(container, order, data, scale) {
            var dataU = data.replace(/\s+/g, "_"); //ex: New York --> New_York
            if (documentQuery("." + ID + "_ordinalSolidHighlights_" + dataU)) {
                return viewportTemporary[data];
            }
            var linear$ID$ = _input_.linear[linearID],
                refPath = undefined,
                isRef = undefined,
                operateOn = data ? linear$ID$.categories[data] : undefined;
            if (!data || !operateOn) {
                return {
                    __lexiconExtend__: function() {
                        void(0)
                    },
                    __lexiconShrink__: massShrink
                }
            }
            var operateOnIntervals = operateOn.intervals,
                operateOnIntervals = operateOnIntervals ? operateOnIntervals : (isRef = true, refPath = _input_.linear[+operateOn].categories[data], refPath.intervals);
            if (!operateOnIntervals) {
                return {
                    __lexiconExtend__: function() {
                        void(0)
                    },
                    __lexiconShrink__: massShrink
                }
            }

            var mode = linear$ID$.mode,
                doExistMode = !!mode,
                sort = linear$ID$.sort,
                doExistSort = !!sort,
                offset = doExistMode ? typeof mode === "object" ? mode[1] : 0 : undefined,
                mode = doExistMode ? typeof mode === "object" ? mode[0] : mode : undefined,
                operateOnNames = operateOn.names,
                doExistNames = !!operateOnNames,
                names = doExistNames ?
                typeof operateOnNames === "string" ? [operateOnNames] : operateOnNames :
                isRef ? typeof refPath.names === "string" ? [refPath.names] : refPath.names :
                undefined,
                converted = typeof operateOnIntervals === "object" ? operateOnIntervals.slice() : [operateOnIntervals],
                converted = coerceToNumber(converted), //coerce all to number
                converted = doExistSort ? sortInterval(sort, undefined, names, converted) : converted,
                cOrdinal = _input_.ordinal[ordinalID], //current ordinal
                cColors = cOrdinal.colors, //current colors
                cState = "colors" in cOrdinal, //current color state
                isObjColors = cState ? typeof cColors[data] === "object" : false,
                colorsLength = isObjColors ? cColors[data].length : undefined,
                cOrdinalModeValue = cOrdinal.mode,
                cOrdinalMode = !!cOrdinalModeValue,
                stackingContext = converted.map(function(d, i, a) {
                    var x = a.slice(0, i).reduce(function(ac, d, i, a) {
                        return typeof d === "object" ? ac + (d[1] - d[0]) : ac + d
                    }, 0);
                    return [x, typeof d === "object" ? x + (d[1] - d[0]) : x + d]
                }),
                stackingContextLength = stackingContext.length,
                stackingSpan = stackingContext[stackingContext.length - 1][1],
                stackingStep = stackingSpan / stackingContextLength,
                stackingContextOrdinal = cOrdinalModeValue === "stackEqual" ? stackingContext.map(function(d, i) {
                    return [i * stackingStep, (i + 1) * stackingStep]
                }) : restackOrdinal(stackingContext, stackingStep, stackingSpan),
                stackingContextLinear = mode === "intervalize" ? converted.map(function(d, i, a) {
                    return [0, typeof d === "object" ? (d[1] - d[0]) : d]
                }) : stackingContext,
                stackingSpanLinear = mode === "intervalize" ? max.apply(this, Array.prototype.concat.apply([], stackingContextLinear).map(function(d) {
                    return +d
                })) : stackingSpan,
                gStackContext = gStackObj[data] || 0;
            doExistMode ? offset ? converted = stackingContextLinear.map(function(d, i) {
                return [d[0] + offset + gStackContext, d[1] + offset + gStackContext]
            }) : converted = stackingContextLinear.map(function(d, i) {
                return [d[0] + gStackContext, d[1] + gStackContext]
            }) : void(0);

            switch (gModeCondition) {
                case 0: //no gMode,
                    void(0);
                    break;
                case 1: //gMode, stack, no mode,
                    converted = converted.map(function(u, w) {
                        return typeof u === "object" ? [u[0] + gStackObj[data], u[1] + gStackObj[data]] : u + gStackObj[data]
                    });
                    break;
                case 5: //gMode, stack, mode,
                    break;
                case 3: //gMode, justify, no mode,
                    converted = converted.map(function(u, w) {
                        return typeof u === "object" ? [u[0] + gStackObj[data], u[1] + gStackObj[data]] : u + gStackObj[data]
                    });
                    break;
                case 7: //gMode, justify, mode,
                    break;
            }

            var expanded = [].concat.apply([], converted.map(function(d, i) {
                return [
                    [d, "left"],
                    [d, "right"]
                ]
            }));
            var selection = viewportTemporary.selectAll("." + ID + "_ordinalSolidHighlights_" + dataU).data(expanded)
                .enter()
                .append("path")
                .attr("fill", "none")
                .attr("stroke", function() {
                    return returnColor("stroke", cState, isObjColors, cColors, colorsLength, order, data)
                })
                .attr("stroke-opacity", 0.9)
                .attr("stroke-width", 2)
                .attr("stroke-linecap", "round")
                .attr("class", ID + "_ordinalSolidHighlights_" + dataU)
                .each(function(dd, ii) {
                    this.extend = extend.bind(this, order, dd, (cOrdinalMode ? stackingContextOrdinal[floor(ii / 2)] : undefined), stackingSpan);
                    this.shrink = shrink.bind(this, order, dd);
                });

            function extend(order, domainExpanded, $stackingContext, $stackingSpan) {
                if (!this.__pointData__) {
                    var node = this.cloneNode();
                    node.setAttribute("d", drawSolidCurve(order, domainExpanded[0], domainExpanded[1], scale, $stackingContext, $stackingSpan));
                    var totalLength = node.getTotalLength();
                    this.__pointData__ = [];
                    this.__pointData__.totalLength = totalLength;
                    for (var i = 0, sampleD = 3, point = node.getPointAtLength(0); i * sampleD <= totalLength; ++i, point = node.getPointAtLength(i * sampleD)) {
                        this.__pointData__.push([point.x, point.y])
                    }
                }
                var overhang = floor(((this.hasAttribute("d") ? this.getTotalLength() : 0) / this.__pointData__.totalLength) * this.__pointData__.length);
                d3.select(this)
                    .attr("visibility", "visible")
                    .transition()
                    .attrTween("d", function() {
                        var length = this.__pointData__.length;
                        return (function(t) {
                            return basis(this.__pointData__.slice(0, ceil(t * length + (1 - t) * overhang)))
                        }).bind(this)
                    })
                    .delay(0)
                    .duration(250);
            }

            function shrink(order, domainExpanded) {
                if (!this.__pointData__) {
                    return
                }
                var overhang = this.__pointData__.slice(0, floor((this.getTotalLength() / this.__pointData__.totalLength) * this.__pointData__.length) || 1);
                d3.select(this) //.classed(ID+"_ordinalSolidHighlights",false)
                    .transition()
                    .attrTween("d", function() {
                        var length = overhang.length;
                        return function(t) {
                            return basis(overhang.slice(0, ceil((1 - t) * length + 1)))
                        }
                    })
                    .each("end", function() {
                        d3.select(this).attr("visibility", "hidden");
                        //d3.select(this).remove()
                    })
                    .delay(0)
                    .duration(round(overhang.length / this.__pointData__.length * 1000));
            }

            function massExtend() {
                selection.each(function() {
                    this.extend();
                })
            }

            function massShrink() {
                d3.selectAll("." + ID + "_ordinalSolidHighlights_" + dataU).each(function() {
                    this.shrink();
                })
            }
            selection.__lexiconExtend__ = massExtend;
            selection.__lexiconShrink__ = massShrink;
            return viewportTemporary[data] = selection;
        }

        function sortObject(obj) {
            var arr = [];
            for (var i in obj) {
                var j = obj[i].intervals ?
                    typeof obj[i].intervals === "object" ?
                    reduceObj(obj[i].intervals) :
                    +obj[i].intervals :
                    typeof obj[i] === "object" ?
                    reduceObj(obj[i]) :
                    +obj[i];
                arr.push([i, j]);
            }
            return arr.sort(function(a, b) {
                return a[1] - b[1]
            }).map(function(d, i) {
                return d[0]
            });

            function reduceObj(obj) {
                var objectified = obj.map(function(d, i) {
                    return typeof d === "object" ? d : [+d, +d]
                });
                var flattened = [].concat.apply([], objectified);
                for (var i = 0, total = 0; i < flattened.length; total += +flattened[i], ++i) {}
                return total / i;
            }
        }

        function sortInterval(sortOpt, indexPlaceHolder, names, intervals) {
            var base = intervals.length;
            /*
            Below is an explanation of sort parameters, indexes are preserved, so the sorting should be stable.
            	">" : sort ascending based on the maximum value of the array or the value.
            	"<" : sort descending based on the maximum value of the array or the value.
            	"|>|": sort ascending based on the interval of the array or 0 if primitive value.
            	"|<|": sort descending based on the interval of the array or 0 if primitive value.
            */
            switch (sortOpt) {
                case ">":
                    return intervals
                        .map(function(d, i) {
                            return typeof d === "object" ? [max.apply(this, d) * base + i, i, d] : [d * base + i, i, d];
                        })
                        .sort(function(a, b) {
                            return a[0] - b[0];
                        })
                        .map(function(d, i) {
                            indexPlaceHolder ? indexPlaceHolder[i] = d[1] : void(0);
                            return d[2];
                        })
                case "<":
                    return intervals
                        .map(function(d, i) {
                            return typeof d === "object" ? [max.apply(this, d) * base + i, i, d] : [d * base + i, i, d];
                        })
                        .sort(function(a, b) {
                            return -a[0] + b[0];
                        })
                        .map(function(d, i) {
                            indexPlaceHolder ? indexPlaceHolder[i] = d[1] : void(0);
                            return d[2];
                        })
                case "|>|":
                    return intervals
                        .map(function(d, i) {
                            return typeof d === "object" ? [abs(d[1] - d[0]) * base + i, i, d] : [i, i, d];
                        })
                        .sort(function(a, b) {
                            return a[0] - b[0];
                        })
                        .map(function(d, i) {
                            indexPlaceHolder ? indexPlaceHolder[i] = d[1] : void(0);
                            return d[2];
                        })
                case "|<|":
                    return intervals
                        .map(function(d, i) {
                            return typeof d === "object" ? [abs(d[1] - d[0]) * base + i, i, d] : [i, i, d];
                        })
                        .sort(function(a, b) {
                            return -a[0] + b[0];
                        })
                        .map(function(d, i) {
                            indexPlaceHolder ? indexPlaceHolder[i] = d[1] : void(0);
                            return d[2];
                        })
                case "s>":
                    return intervals
                        .map(function(d, i) {
                            return [names ? names[i] : names, i, d];
                        })
                        .sort(function(a, b) {
                            return +(a[0] > b[0]) || +(a[0] === b[0]) - 1;
                        })
                        .map(function(d, i) {
                            indexPlaceHolder ? indexPlaceHolder[i] = d[1] : void(0);
                            return d[2];
                        })
                case "s<":
                    return intervals
                        .map(function(d, i) {
                            return [names ? names[i] : names, i, d];
                        })
                        .sort(function(a, b) {
                            return +(a[0] < b[0]) || +(a[0] === b[0]) - 1;
                        })
                        .map(function(d, i) {
                            indexPlaceHolder ? indexPlaceHolder[i] = d[1] : void(0);
                            return d[2];
                        })
            }
        }

        //subs, mostly from I-PV
        function warp(ID, width, height) {
            //console.log(ID+" "+width+" "+height+" !");
            d3.select("#" + ID).transition("adjustX").attr("x", function() {
                var x = parseInt(d3.select(this).attr("x"));
                return x - width / 2;
            }).delay(0).duration(500);
            d3.select("#" + ID).transition("adjustY").attr("y", function() {
                var y = parseInt(d3.select(this).attr("y"));
                return y - height / 2;
            }).delay(0).duration(500);
            d3.select("#" + ID).transition("adjustW").attr("width", width).delay(0).duration(500);
            d3.select("#" + ID).transition("adjustH").attr("height", height).delay(0).duration(500);
            //d3.select("#"+ID).transition("adjustFO").attr("fill-opacity",0.6).delay(0).duration(1000);
        }
        //bound unwarp, anti-warp
        this.unwarp = function(f) {
            var viewBox = d3.select("#" + ID).attr("viewBox");
            var viewBoxFinal = viewBox.split(" ").map(function(d, i) {
                return d * 100
            }).join(" ");
            d3.select("#" + ID).transition("shrink").each("end", function() {
                d3.select(this).remove();
                if (typeof f === "function") {
                    return f.bind(_this_)();
                }
            }).tween("unwarp", function() {
                var interpolator = d3.interpolate(viewBox, viewBoxFinal);
                return function(t) {
                    this.setAttribute("viewBox", interpolator(t))
                }
            }).delay(0).duration(3000);
            d3.select("#" + ID).transition("fadeAway").style("opacity", 0).delay(0).duration(1000);
        }
        //disable iOS touchmove
        function disableScroll(el) {
            d3.event.preventDefault();
            d3.event.stopPropagation();
        }
        //reEnable iOS touchmove
        function enableScroll(el) {}
        //cleanHover
        function cleanHover() {
            if (currentHovered) {
                currentHovered.parentNode.removeChild(currentHovered);
                currentHovered = null;
            }
        }
        //return Color - I know function calls are expensive but I needed it for maintainability
        function returnColor(whatToReturn, cState, isObjColors, cColors, cColorsLength, i, d, ii, dd) {
            isObjColors = isObjColors || (cState ? typeof cColors[d] === "object" : false);
            switch (whatToReturn) {
                case "ordinal":
                    switch (((+cState) + (+isObjColors)) * (+cState)) {
                        case 0:
                            return colorScale20(i, d);
                        case 1:
                            return cColors[d];
                        case 2:
                            return cColors[d][0];
                    }
                case "linear":
                    switch (((+cState) + (+isObjColors)) * (+cState)) {
                        case 0:
                            return colorScale20(i, d, ii, dd);
                        case 1:
                            return cColors[d];
                        case 2:
                            var temp = cColors[d].slice(1, cColorsLength - 1),
                                tempLength = temp.length;
                            return tempLength ? temp[ii % tempLength] : cColors[d][0];
                    }
                case "stroke":
                    switch (((+cState) + (+isObjColors)) * (+cState)) {
                        case 0:
                            return colorScale20(i, d, ii, dd);
                        case 1:
                            return cColors[d];
                        case 2:
                            return cColors[d][cColorsLength - 1];
                    }
                case "partition":
                    switch (((+cState) + (+isObjColors)) * (+cState)) {
                        case 0:
                            return i & 1 ? "DarkGray" : "LightGray";
                        case 1:
                            return cColors[d];
                        case 2:
                            return cColors[d][0];
                    }
            }
        }
        //coerce to number
        function coerceToNumber(arr) {
            var l = arr.length;
            var v = undefined;
            for (var i = 0; i < l; ++i) {
                v = arr[i];
                typeof v === "object" ?
                    //v = [+v[0],+v[1]] : 
                    (v[0] -= 0, v[1] -= 0) :
                    arr[i] = +v;
            }
            return arr;
        }
        //restack Ordinal for negative values 
        function restackOrdinal(arr, step, span) {
            var l = arr.length;
            var v = undefined;
            var arr2 = [];
            for (var i = 0; i < l; v = arr[i], arr2[i] = abs(v[0] - v[1]), ++i) {}
            var c = 1 / max.apply(this, arr2) * step;
            for (var i = 0, o = 0; i < l; v = arr2[i], arr2[i] = [o, o + v * c], o += v * c, ++i) {}
            for (var i = 0, j = span / o; i < l; v = arr2[i], arr2[i] = [v[0] * j, v[1] * j], ++i) {}
            return arr2;
        }
        //run tests
        (function() {
            //DECLARE DEFAULTS
            _this_.passiveSupported = false;

            //test 1 - check if passive supported
            (function() {
                var options = Object.defineProperty({}, "passive", {
                    get: function() {
                        _this_.passiveSupported = true;
                    }
                })
                window.addEventListener("queryMakerTest", null, options);
            })();
        })()
    }
    var prt = LexiconRainbow.prototype;
    prt.version = "v0.0.9";
    prt.shapeRendering = function(v) {
        if (arguments.length && !this.isAppended) {
            this.getNSet.shapeRendering = v;
            return this;
        } else if (arguments.length && this.isAppended) {
            console.log("You cannot set shape-rendering after calling render method");
        } else {
            return this.getNSet.shapeRendering;
        }
    }
    prt.update = function(type, current) {
        var internal = this.getNSet;
        internal.handleEvent(internal.input[type][current], "onrender" + type.charAt(0).toUpperCase() + type.slice(1), null, true);
        this[type + "G"].update(current);
    }
    prt.GUI = function(bool, o) {
        switch (this.isAppended) {
            case false:
                if (!bool) {
                    this.getNSet.guiIsOn = false;
                    this.setViewBox = guiOff;
                    this.setCanvasDims = guiOffCanvas;
                } else {
                    typeof bool !== "boolean" ? this.getNSet.guiColor = bool :
                        void(0);
                    this.setViewBox = guiOn;
                    this.setCanvasDims = guiOnCanvas;
                }
                return this;
            case true:
                if (!bool) {
                    this.getNSet.guiIsOn = false;
                    this.toggleGUI(false);
                    this.setViewBox = guiOff;
                    this.setCanvasDims = guiOffCanvas;
                } else {
                    this.getNSet.guiIsOn = true;
                    typeof bool !== "boolean" ? this.getNSet.guiColor = bool :
                        void(0);
                    this.toggleGUI(true);
                    this.setViewBox = guiOn;
                    this.setCanvasDims = guiOnCanvas;
                }
                var x = this.getNSet.attrX,
                    y = this.getNSet.attrY,
                    w = this.getNSet.attrW,
                    h = this.getNSet.attrH,
                    nViewBox = this.setViewBox(x, y, w, h);
                this.getNSet.canvas ? this.setCanvasDims(w, h) : void(0);
                d3.select("#" + this.lexID()).transition().attr("viewBox", nViewBox).delay(0).duration(1000);
                return this;
        }

        function guiOff(x, y, w, h) {
            return (x + 0.25 * w + (o ? o.x || 0 : 0)) + " " + (y + (o ? o.y || 0 : 0)) + " " + (x + w * 0.70 + (o ? o.w || 0 : 0)) + " " + (y + h + (o ? o.h || 0 : 0))
        }

        function guiOn(x, y, w, h) {
            return (x + (o ? o.x || 0 : 0)) + " " + (y + (o ? o.y || 0 : 0)) + " " + (x + w + (o ? o.w || 0 : 0)) + " " + (y + h + (o ? o.h || 0 : 0))
        }

        function guiOffCanvas(w, h) {
            this.getNSet.canvas.attr("width", (w * 0.70 + (o ? o.w || 0 : 0))).attr("height", (h + (o ? o.h || 0 : 0)))
        }

        function guiOnCanvas(w, h) {
            this.getNSet.canvas.attr("width", w).attr("height", h)
        }
    }
    prt.getClientXY = function(e) {
        return {
            x: e.clientX || e.changedTouches[0].clientX,
            y: e.clientY || e.changedTouches[0].clientY
        }
    }
    prt.onpickStart = function(enableOnPick, e, oNode, attrW, attrH, width, scaleInTransition, request, handle, input, linearID, d, i) {
        if (!enableOnPick || scaleInTransition) {
            return
        }
        /*clientX and clientY can result in rounding errors so adding +1 solves that. Sometimes accidentally rect 
        with GUI is taken as elementFromPoint*/
        var client = this.getClientXY(e);
        if (d3.select(document.elementFromPoint(client.x + 1, client.y)).classed("partition")) {
            return
        }
        var thisG = d3.select(oNode);
        thisG.transition("draw").ease("linear").attr("transform", function() {
            return "translate(" + (0.25 * attrW + i * width) + ",0)"
        }).delay(0).duration(250);
        thisG.select("rect.main").transition("extend").ease("linear").attr("height", 0.20 * attrH).delay(0).duration(250);
        thisG.select("rect.partition").transition("pushDown").ease("linear").attr("transform", "translate(0," + (0.20 * attrH) + ")").delay(0).duration(250);
        enableOnPick !== "noLineAnim" ? window.requestAnimationFrame(request) : void(0);
        handle({
            name: d,
            item: input.linear[linearID].categories[d]
        }, "onpick", e.type, true);
    }
    prt.onpickEnd = function(enableOnPick, e, oNode, attrW, attrH, width, scaleInTransition, request, handle, input, linearID, d, i) {
        //alert("mouseleave!");
        if (!enableOnPick || scaleInTransition) {
            return
        }
        var client = this.getClientXY(e);
        if (d3.select(document.elementFromPoint(client.x + 1, client.y)).classed("partition")) {
            return
        }
        /*event.relatedTarget or elementFromPoint is completely wrong in ie11 --> gives you the ownerSVG (???!)
        combining user space coordinates with getBBox wont work effectively either. setTimeout above is a mundane solution for only ie11.
        if(this.contains(d3.event.relatedTarget)){return} Kunkkaaaaaa..!?, ow sorry Exploraaaaaaaaarrrr!!!
        if(~Array.prototype.indexOf.call(this.childNodes,d3.event.relatedTarget)){return} //this still wont work propertly with ie11 either.*/
        var thisG = d3.select(oNode);
        thisG.transition("draw").attr("transform", function() {
            return "translate(" + (0.25 * attrW + i * width) + "," + (0.10 * attrH) + ")"
        }).delay(0).duration(500);
        thisG.select("rect.main").transition("extend").attr("height", 0.10 * attrH).delay(0).duration(500);
        thisG.select("rect.partition").transition("pushDown").attr("transform", "translate(0," + (0.10 * attrH) + ")").delay(0).duration(250);
        enableOnPick !== "noLineAnim" ? window.requestAnimationFrame(request) : void(0);
        handle({
            name: d,
            item: input.linear[linearID].categories[d]
        }, "onpick", e.type, false);
    }
    return LexiconRainbow;
}));