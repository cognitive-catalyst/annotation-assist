
var 

animations = require('animations');

module.exports = React.createClass({

	render: function(){

		var doc = {

			xmlns: "http://www.w3.org/2000/svg",
			xlink: "http://www.w3.org/1999/xlink",
			viewbox: "-10 -10 300 300",

			orbits: [

				{
					id: "orbit-5",
					fill: "none",
					stroke: this.props.color,
					strokeWidth: "9",
					strokeMiterLimit: "10",
					strokeDashArray: "1000",
					strokeDashOffset: "1000",
					strokeLineCap: "round",
					d: "M140.8 250.6c61.9 0 112-50.1 112-112s-50.1-112-112-112c-23 0-44.3 6.9-62.1 18.8-30.1 20.1-49.9 54.3-49.9 93.2 0 61.8 50.1 112 112 112z"
			    },

			  	{
			  		id: "orbit-4",
			  		fill: "none",
			  		stroke: this.props.color,
			  		strokeWidth: "9",
			  		strokeMiterLimit: "10",
			  		strokeDashArray: "1000",
			  		strokeDashOffset: "1000",
			  		strokeLineCap: "round",
			  		d: "M144.6 160.3c5.8-.9 11.6-1.9 17.1-3 52.6-10.2 91.6-26.6 89.6-38.7-2.1-13.4-53.4-16.4-114.5-6.7-61 9.6-108.8 28.3-106.6 41.7s53.3 16.3 114.4 6.7z"
			    },

			    {
			  		id: "orbit-3",
			  		fill: "none",
			  		stroke: this.props.color,
			  		strokeWidth: "9",
			  		strokeMiterLimit: "10",
			  		strokeDashArray: "1000",
			  		strokeDashOffset: "1000",
			  		strokeLineCap: "round",
			  		d: "M181.9 189.5c47.2-38.2 65.1-93.6 42.4-121.7S144.8 47.9 97.6 86.2s-67 92-44.3 120.1c22.8 28.1 81.4 21.4 128.6-16.8z"
			    },

			    {
			  		id: "orbit-2",
			  		fill: "none",
			  		stroke: this.props.color,
			  		strokeWidth: "9",
			  		strokeMiterLimit: "10",
			  		strokeDashArray: "1000",
			  		strokeDashOffset: "1000",
			  		strokeLineCap: "round",
			  		d: "M162.2 142c13.7-59.2 14.3-109.6 1.4-112.6s-37.3 41.9-51 101.1-11.4 110.3 1.5 113.2c12.8 3 34.4-42.5 48.1-101.7z"
			    },

			    {
			  		id: "orbit-1",
			  		fill: "none",
			  		stroke: this.props.color,
			  		strokeWidth: "9",
			  		strokeMiterLimit: "10",
			  		strokeDashArray: "1000",
			  		strokeDashOffset: "1000",
			  		strokeLineCap: "round",
			  		d: "M186.5 89.2c-43.7-42.2-102-54.8-126.9-29-24.9 25.8-9.7 81 34 123.2S193 238.8 217.9 213c24.9-25.8 12.3-81.6-31.4-123.8z"
			    }

			],

			circles: [

				{	
					id: "exterior-stroke",
					fill: "none",
					stroke: this.props.color,
					strokeWidth: "12",
					cx: "140",
					cy: "140",
					r: "140",
					strokeDashArray: "1000",
					strokeDashOffset: "1000",
					strokeLineCap: "round",

					animate: [

						{
							xlinkHref: "#exterior-stroke",
							id: "ani-exterior-stroke-complete",
							attributeName: "stroke-dashoffset",
							from: "800",
							to: "0",
							dur: "0.5s",
							fill: "freeze",
							repeatCount:"1",
							begin: "false"
						},

						{
							xlinkHref: "#orbit-1",
							attributeName: "stroke-dashoffset",
							from: "1000",
							to: "0",
							dur: "1s",
							fill: "freeze",
							begin: "0.5s"
						},

						{
							xlinkHref: "#orbit-2",
							attributeName: "stroke-dashoffset",
							from: "1000",
							to: "0",
							dur: "1s",
							fill: "freeze",
							begin: "0.5s"
						},

						{
							xlinkHref: "#orbit-3",
							attributeName: "stroke-dashoffset",
							from: "1000",
							to: "0",
							dur: "1s",
							fill: "freeze",
							begin: "0.5s"
						},


						{
							xlinkHref: "#orbit-4",
							attributeName: "stroke-dashoffset",
							from: "998",
							to: "0",
							dur: "1s",
							fill: "freeze",
							begin: "0.5s"
						},

						{
							xlinkHref: "#orbit-5",
							attributeName: "stroke-dashoffset",
							from: "998",
							to: "0",
							dur: "0.1s",
							fill: "freeze",
							begin: "0s"
						},

						{
							xlinkHref: "#exterior-stroke",
							id: "ani-exterior-stroke",
							attributeName: "stroke-dashoffset",
							from: "1000",
							to: "800",
							dur: "0.5s",
							fill: "freeze",
							repeatCount: "1",
							begin: "1s"
						}
					],

					animateTransform: {
						xlinkHref: "#exterior-stroke",
						attributeName: "transform",
						attributeType: "XML",
						type: "rotate",
						from: "0 140 140",
						to: "360 140 140",
						dur:"1s",
						begin: "1s",
						repeatCount: "indefinite",
						fill: "freeze"
					}
			    },

			    {
			    	fill: this.props.color,
			    	r:"15",

			    	animateMotion: {
		    			id: "animation-1",
		    			dur: "1.2s",
		    			repeatCount: "1",
		    			calcMode: "spline",
		    			keyTimes: "0;1",
		    			keyPoints: "0;.5",
		    			keySplines: "0 0 0 1",
		    			fill: "freeze",
		    			begin: "0s",

		    			mpath: {
		    				xlinkHref: "#orbit-1"
		    			}
			    	}
			    },

			    {
			    	fill: this.props.color,
			    	r:"15",

			    	animateMotion: {
		    			dur: "1.4s",
		    			repeatCount: "1",
		    			calcMode: "spline",
		    			keyTimes: "0;1",
		    			keyPoints: ".8;0",
		    			keySplines: "0 0 0 1",
		    			fill: "freeze",
		    			begin: "0s",

		    			mpath: {
		    				xlinkHref: "#orbit-2"
		    			}
			    	}
			    },

			    {
			    	fill: this.props.color,
			    	r:"15",

			    	animateMotion: {
		    			dur: "1.6s",
		    			repeatCount: "1",
		    			calcMode: "spline",
		    			keyTimes: "0;1",
		    			keyPoints: ".5;0",
		    			keySplines: "0 0 0 1",
		    			fill: "freeze",
		    			begin: "0s",

		    			mpath: {
		    				xlinkHref: "#orbit-3"
		    			}
			    	}
			    },

			    {
			    	fill: this.props.color,
			    	r:"15",

			    	animateMotion: {
		    			dur: "1.6s",
		    			repeatCount: "1",
		    			calcMode: "spline",
		    			keyTimes: "0;1",
		    			keyPoints: "0;.6",
		    			keySplines: "0 0 0 1",
		    			fill: "freeze",
		    			begin: "0s",

		    			mpath: {
		    				xlinkHref: "#orbit-4"
		    			}
			    	}
			    },

			    {
			    	fill: this.props.color,
			    	r:"11",

			    	animateMotion: {
		    			dur: "1.4s",
		    			repeatCount: "1",
		    			calcMode: "spline",
		    			keyTimes: "0;1",
		    			keyPoints: "0;1",
		    			keySplines: "0 0 0 1",
		    			fill: "freeze",
		    			begin: "0s",

		    			mpath: {
		    				xlinkHref: "#orbit-4"
		    			}
			    	}
			    }
			]
		},

		orbits = doc.orbits.map(function(orbit, i){

			return (

				<path id={orbit.id}
					  fill={orbit.fill}
					  stroke={orbit.stroke}
					  stroke-width={orbit.strokeWidth}
					  stroke-miterlimit={orbit.strokeMiterLimit}
					  stroke-dasharray={orbit.strokeDashArray}
					  stroke-dashoffset={orbit.strokeDashOffset}
					  stroke-linecap={orbit.strokeLineCap}
					  d={orbit.d}
					  key={i}/>
			);
		}),

		circles = doc.circles.map(function(circle, i){

			var animate = circle.animate.map(function(animate, i){

				return (

					<animate xlink:href={animate.xlinkHref}
						id={animate.id || ''}
						attributeName={animate.attributeName}
						from={animate.from}
						to={animate.to}
						dur={animate.dur}
						fill={animate.fill}
						begin={animate.begin}
						repeatCount={animate.repeatCount || ''}
						key={i}/>
				);
			}),

			animateTransform = circle.animateTransform.length;

			return (

				<circle 
					id={circle.id || ''}
				    fill={circle.fill} 
				    stroke={circle.stroke} 
				    stroke-width={circle.strokeWidth} 
				    cx={circle.cx} 
				    cy={circle.cy} 
				    r={circle.r} 
				    stroke-dasharray={circle.strokeDashArray}
				    stroke-dashoffset={circle.strokeDashOffset} 
				    stroke-linecap={circle.strokeLineCap}
				    key={i}>

					{animate}

					{
						(function(){

						if(animateTransform >= 1){
							
							return (

								<animateTransform
									xlink:href={circle.animateTransform.xlinkHref}
									attributeName={circle.animateTransform.attributeName}
									attributeType={circle.animateTransform.attributeType}
									type={circle.animateTransform.type}
									from={circle.animateTransform.from}
									to={circle.animateTransform.to}
									dur={circle.animateTransform.dur}
									begin={circle.animateTransform.begin}
									repeatCount={circle.animateTransform.repeatCount}
									fill={circle.animateTransform.fill}/>
							);
						}

						})()
					}
					
					<animateMotion
						id={circle.animateMotion.id || ''}
						dur={circle.animateMotion.dur}
						repeatCount={circle.animateMotion.repeatCount}
						calcMode={circle.animateMotion.calcMode}
						keyTimes={circle.animateMotion.keyTimes}
						keyPoints={circle.animateMotion.keyPoints}
						keySplines={circle.animateMotion.keySplines}
						fill={circle.animateMotion.fill}
						begin={circle.animateMotion.begin}>
						<mpath xlink:href={circle.animateMotion.mpath.xlinkHref}/>
					</animateMotion>
				</circle>
			);
		});

		return (

			<svg 
				width={this.props.width + 'px'} 
				height={this.props.height + 'px'} 
				className="scale-up" 
				xmlns={doc.xmlns} 
				xmlns:xlink={doc.xlink} 
				viewBox={doc.viewbox}>

				{orbits}
				{circles}

				<defs>
					<style>
						<![CDATA[{animations}]]>
					</style>
				</defs>
			</svg>
		);
	}
});
