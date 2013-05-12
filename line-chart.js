angular.module('n3-charts.linechart', [])

.factory('lineUtil', function() {
  return {
    getDefaultMargins: function() {
      return {top: 20, right: 50, bottom: 30, left: 50};
    },
    
    clean: function(element) {
      d3.select(element).select('svg').remove();
    },
    
    bootstrap: function(element, dimensions) {
      d3.select(element).classed('linechart', true);
      
      var width = dimensions.width;
      var height = dimensions.height;

      var svg = d3.select(element).append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
          .attr('transform', 'translate(' + dimensions.left +
            ',' + dimensions.top + ')'
          );
      
      return svg;
    },
    
    getTooltipTextWidth: function(text) {
      return Math.max(25, text.length*6.5);
    },
    
    getWidestOrdinate: function(data, series) {
      var widest = '';
      
      data.forEach(function(row) {
        series.forEach(function(series) {
          if (('' + row[series.y]).length > ('' + widest).length) {
            widest = row[series.y];
          }
        })
      })
      
      return widest;
    },
    
    addAxes: function(svg, dimensions, drawY2Axis) {
      var width = dimensions.width;
      var height = dimensions.height;
      
      width = width - dimensions.left - dimensions.right;
      height = height - dimensions.top - dimensions.bottom;
      
      var x = d3.scale.linear().rangeRound([0, width]);
      var y = d3.scale.linear().rangeRound([height, 0]);
      var y2 = d3.scale.linear().rangeRound([height, 0]);
      
      var xAxis = d3.svg.axis().scale(x).orient('bottom');
      var yAxis = d3.svg.axis().scale(y).orient('left');
      var y2Axis = d3.svg.axis().scale(y2).orient('right');
      
      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);
      
      svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);
      
      if (drawY2Axis) {
        svg.append('g')
          .attr('class', 'y2 axis')
          .attr('transform', 'translate(' + width + ', 0)')
          .call(y2Axis);
      }
      
      this.addTooltips(svg, width, height, drawY2Axis);
      
      return {
        xScale: x, yScale: y, y2Scale: y2,
        xAxis: xAxis, yAxis: yAxis, y2Axis: y2Axis
      }
    },
    
    addTooltips: function (svg, width, height, drawY2Axis) {
      var w = 24;
      var h = 18;
      var p = 5;
      
      var xTooltip = svg.append('g')
        .attr({
          'id': 'xTooltip',
          'opacity': 0
        });
      
      xTooltip.append('path')
        .attr({
          'transform': 'translate(0,' + (height + 1) + ')'
        });
      
      xTooltip.append('text')
        .style({
          'text-anchor': 'middle'
        })
        .attr({
          'width': w,
          'height': h,
          'font-family': 'monospace',
          'font-size': 10,
          'transform': 'translate(0,' + (height + 19) + ')',
          'fill': 'white',
          'text-rendering': 'geometric-precision'
        });
      
      var yTooltip = svg.append('g')
        .attr({
          'id': 'yTooltip',
          'opacity': 0
        });
      
      yTooltip.append('path');
      yTooltip.append('text')
        .attr({
          'width': h,
          'height': w,
          'font-family': 'monospace',
          'font-size': 10,
          'fill': 'white',
          'text-rendering': 'geometric-precision'
        });
      
      if (drawY2Axis) {
        var y2Tooltip = svg.append('g')
          .attr({
            'id': 'y2Tooltip',
            'opacity': 0,
            'transform': 'translate(' + width + ',0)'
          });
        
        y2Tooltip.append('path');
        
        y2Tooltip.append('text')
          .attr({
            'width': h,
            'height': w,
            'font-family': 'monospace',
            'font-size': 10,
            'fill': 'white',
            'text-rendering': 'geometric-precision'
          })
      }
    },
    
    createContent: function(svg) {
      svg.append('g')
        .attr('class', 'content');
    },
    
    drawLines: function(svg, scales, data, interpolateMode) {
      var drawers = {
        y: this.createLeftLineDrawer(scales, interpolateMode),
        y2: this.createRightLineDrawer(scales, interpolateMode)
      };
      
      svg.select('.content').selectAll('.lineGroup')
        .data(data)
        .enter().append('g')
          .style('stroke', function(serie) {return serie.color;})
          .attr('class', 'lineGroup')
          .append('path')
            .attr('class', 'line')
            .attr('d', function(d) {return drawers[d.axis](d.values);});
    },
    
    createLeftLineDrawer: function(scales, interpolateMode) {
      return d3.svg.line()
        .x(function(d) {return scales.xScale(d.x);})
        .y(function(d) {return scales.yScale(d.value);})
        .interpolate(interpolateMode);
    },
    
    createRightLineDrawer: function(scales, interpolateMode) {
      return d3.svg.line()
        .x(function(d) {return scales.xScale(d.x);})
        .y(function(d) {return scales.y2Scale(d.value);})
        .interpolate(interpolateMode);
    },
    
    drawArea: function(svg, scales, data, interpolateMode){
      var drawers = {
        y: this.createLeftAreaDrawer(scales, interpolateMode),
        y2: this.createRightAreaDrawer(scales, interpolateMode)
      };
      
      svg.select('.content').selectAll('.areaGroup')
        .data(data).enter().append('g')
          .style('fill', function(serie) {return serie.color;})
          .attr('class','areaGroup')
          .append('path')
            .style('opacity', '0.1')
            .attr('class', 'area')
            .attr('d',  function(d) {return drawers[d.axis](d.values);});
    },
    
    createLeftAreaDrawer: function(scales, interpolateMode) {
      return d3.svg.area()
        .x(function(d) {return scales.xScale(d.x);})
        .y0(function(d) {return scales.yScale(0);})
        .y1(function(d) {return scales.yScale(d.value);})
        .interpolate(interpolateMode);
    },
    
    createRightAreaDrawer: function(scales, interpolateMode) {
      return d3.svg.area()
        .x(function(d) {return scales.xScale(d.x);})
        .y0(function(d) {return scales.y2Scale(0);})
        .y1(function(d) {return scales.y2Scale(d.value);})
        .interpolate(interpolateMode);
    },
    
    drawDots: function(svg, axes, data) {
      var that = this;
      
      svg.select('.content').selectAll('.dotGroup')
        .data(data).enter().append('g')
          .attr('class', 'dotGroup')
          .attr('fill', function(s) {return s.color;})
          .on('mouseover', function(s) {
            var target = d3.select(d3.event.target);
            target.attr('r', 4);
            
            that.updateXTooltip(target, s);
            if (s.axis === 'y2') {
              that.updateY2Tooltip(target, s);
            } else {
              that.updateYTooltip(target, s);
            }
          })
          .on('mouseout', function(d) {
            d3.select(d3.event.target).attr('r', 2);
            that.hideTooltips();
          })
          .selectAll('.dot').data(function(d) {return d.values;})
            .enter().append('circle')
            .attr({
              'class': 'dot',
              'r': 2,
              'cx': function(d) {return axes.xScale(d.x)},
              'cy': function(d) {return axes[d.axis + 'Scale'](d.value)}
            })
    },
    
    updateXTooltip: function(dot, series) {
      var xTooltip = d3.select("#xTooltip")
        .transition()
        .attr({
          'opacity': 1.0,
          'transform': 'translate(' + dot.attr('cx') + ',0)'
        })
        
      var textX = '' + dot.datum().x;
      xTooltip.select('text').text(textX)
      xTooltip.select('path')
        .attr('fill', series.color)
        .attr('d', this.getXTooltipPath(textX));
    },
    
    getXTooltipPath: function(text) {
      var w = this.getTooltipTextWidth(text);
      var h = 18;
      var p = 5; // Size of the 'arrow' that points towards the axis
      
      return 'm-' + w/2 + ' ' + p + ' ' +
        'l0 ' + h + ' ' +
        'l' + w + ' 0 ' +
        'l0 ' + '-' + h +
        'l-' + (w/2 - p) + ' 0 ' +
        'l-' + p + ' -' + h/4 + ' ' +
        'l-' + p + ' ' + h/4 + ' ' +
        'l-' + (w/2 - p) + ' 0z';
    },
    
    updateYTooltip: function(dot, series) {
      var yTooltip = d3.select("#yTooltip")
        .transition()
        .attr({
          'opacity': 1.0,
          'transform': 'translate(0, ' + dot.attr('cy') + ')'
        })
      
      var textY = '' + dot.datum().value;
      var yTooltipText = yTooltip.select('text').text(textY);
      yTooltipText.attr(
        'transform',
        'translate(-' + (this.getTooltipTextWidth(textY) + 2) + ',3)'
      );
      yTooltip.select('path')
        .attr('fill', series.color)
        .attr('d', this.getYTooltipPath(textY));
    },
    
    getYTooltipPath: function(text) {
      var w = this.getTooltipTextWidth(text);
      var h = 18;
      var p = 5; // Size of the 'arrow' that points towards the axis
      
      return 'm0 0' +
        'l-' + p + ' -' + p + ' ' +
        'l0 -' + (h/2 - p) + ' ' +
        'l-' + w + ' 0 ' +
        'l0 ' + h + ' ' +
        'l' + w + ' 0 ' +
        'l0 -' + (h/2 - p) +
        'l-' + p + ' ' + p + 'z';
    },
    
    updateY2Tooltip: function(dot, series) {
      var y2Tooltip = d3.select("#y2Tooltip")
        .transition()
        .attr({
          'opacity': 1.0
        })
      
      var cy = parseFloat(dot.attr('cy'));
      
      var textY = '' + dot.datum().value;
      var y2TooltipText = y2Tooltip.select('text').text(textY);
      y2TooltipText.attr(
        'transform',
        'translate(7, ' + (cy + 3) + ')'
      );
      y2Tooltip.select('path')
        .attr({
          'fill': series.color,
          'd': this.getY2TooltipPath(textY),
          'transform': 'translate(0, ' + cy + ')'
        })
    },
    
    getY2TooltipPath: function(text) {
      var w = this.getTooltipTextWidth(text);
      var h = 18;
      var p = 5; // Size of the 'arrow' that points towards the axis
      
      return 'm0 0' +
        'l' + p + ' ' + p + ' ' +
        'l0 ' + (h/2 - p) + ' ' +
        'l' + w + ' 0 ' +
        'l0 -' + h + ' ' +
        'l-' + w + ' 0 ' +
        'l0 ' + (h/2 - p) + ' ' +
        'l-' + p + ' ' + p + 'z'
    },
    
    hideTooltips: function() {
      d3.select("#xTooltip")
        .transition()
        .attr({
          'opacity': .0
        })
      
      d3.select("#yTooltip")
        .transition()
        .attr({
          'opacity': .0
        })
      
      d3.select("#y2Tooltip")
        .transition()
        .attr({
          'opacity': .0
        })
    },
    
    getLineData: function(data, options) {
      var series = options ? options.series : null;
      
      if (!series || !series.length || !data || !data.length) {
        return [];
      } 
      
      var lineData = [];
      
      series.forEach(function(s) {
        var seriesData = {
          name: s.y,
          values: [],
          color: s.color,
          axis: s.axis || 'y'
        };
        
        data.forEach(function(row) {
          seriesData.values.push({
            x: row.x,
            value: row[s.y],
            axis: s.axis || 'y'
          })
        });
        
        lineData.push(seriesData);
      });
      
      return lineData;
    },
    
    setScalesDomain: function(scales, data, series, svg) {
      scales.xScale.domain(d3.extent(data, function(d) {return d.x;}));
      
      var ySeries = series.filter(function(s) {return s.axis !== 'y2'});
      var y2Series = series.filter(function(s) {return s.axis === 'y2'});
      
      scales.yScale.domain(this.yExtent(ySeries, data)).nice();
      scales.y2Scale.domain(this.yExtent(y2Series, data)).nice();
      
      svg.selectAll('.x.axis').call(scales.xAxis)
      svg.selectAll('.y.axis').call(scales.yAxis)
      svg.selectAll('.y2.axis').call(scales.y2Axis)
    },
    
    yExtent: function(series, data) {
      var minY = Number.POSITIVE_INFINITY;
      var maxY = Number.NEGATIVE_INFINITY;
      
      series.forEach(function(s) {
        minY = Math.min(minY, d3.min(data, function(d) {return d[s.y]}));
        maxY = Math.max(maxY, d3.max(data, function(d) {return d[s.y]}));
      });
      
      return [minY, maxY];
    },
    
    haveSecondYAxis: function(series) {
      var doesHave = false;
      
      angular.forEach(series, function(s) {
        doesHave = doesHave || s.axis === 'y2';
      });
      
      return doesHave;
    },
    
    resetMargins: function(dimensions) {
      var defaults = this.getDefaultMargins();
      
      dimensions.left = defaults.left;
      dimensions.right = defaults.right;
      dimensions.top = defaults.top;
      dimensions.bottom = defaults.bottom;
    },
    
    adjustMargins: function(dimensions, options, data) {
      this.resetMargins(dimensions);
      
      if (!data || data.length === 0) {
        return;
      }
      
      var series = (options && options.series) ? options.series : [];
      
      var leftSeries = series.filter(function(s) {return s.axis !== 'y2'});
      var leftWidest = this.getWidestOrdinate(data, leftSeries);
      dimensions.left = this.getTooltipTextWidth('' + leftWidest) + 20;
      
      var rightSeries = series.filter(function(s) {return s.axis === 'y2'});
      if (rightSeries.length === 0) {
        return;
      }
      var rightWidest = this.getWidestOrdinate(data, rightSeries);
      dimensions.right = this.getTooltipTextWidth('' + rightWidest) + 20;
    }
  }
})

.directive('linechart', function(lineUtil, $window) {
  var link  = function(scope, element, attrs, ctrl) {
    var dim = lineUtil.getDefaultMargins();
    
    scope.updateDimensions = function(dimensions) {
      dimensions.width = element[0].parentElement.offsetWidth || 900;
      dimensions.height = element[0].parentElement.offsetHeight || 500;
    }
    
    scope.update = function() {
      scope.updateDimensions(dim);
      scope.redraw(dim);
    };
    
    scope.redraw = function(dimensions) {
      var data = scope.data;
      var options = scope.options;
      var series = options && options.series ? options.series : [];
      
      var lineData = lineUtil.getLineData(data, options);
      
      lineUtil.adjustMargins(dimensions, options, data);
      lineUtil.clean(element[0]);
      
      var haveSecondYAxis = lineUtil.haveSecondYAxis(series);
      
      var svg = lineUtil.bootstrap(element[0], dimensions);
      var axes = lineUtil.addAxes(svg, dimensions, haveSecondYAxis);
      
      lineUtil.createContent(svg);
      
      var lineMode = options ? options.lineMode : 'linear';
      
      if (lineData.length > 0) {
        lineUtil.setScalesDomain(axes, data, options.series, svg);
        
        if (options.showArea === true) {
          // This has waaaay too many arguments
          lineUtil.drawArea(svg, axes, lineData, lineMode);
        }
        
        lineUtil.drawLines(svg, axes, lineData, lineMode);
        
        lineUtil.drawDots(svg, axes, lineData);
      }
    }
    
    $window.onresize = function() {
      scope.update();
    }
    
    scope.$watch('data', scope.update);
    scope.$watch('options', scope.update, true);
  };
  
  return {
    replace: true,
    restrict: 'E',
    scope: {data: '=', options: '='},
    template: '<div></div>',
    link: link
  };
});