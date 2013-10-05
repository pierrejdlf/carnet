var mute = false;
var killinglock = {left:false,right:false};

function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }

var build_panels = function(unikid,basePath) {

	var imagesFold = basePath + "/media/images/";
	var audioFold = basePath + "/media/audio/";
	var DURSLIDE = 1700;
	var AUDIOCOEFF = 0.6;
	var NLOAD = 3;
	var nLoaded = 0;
	var currentIndex = {'left':0,'right':0};

	var coordinates = [0, 0],
		w = window,
		d = document,
		e = d.documentElement,
		g = d.getElementsByTagName('body')[0],
		W = w.innerWidth || e.clientWidth || g.clientWidth,
		H = w.innerHeight|| e.clientHeight|| g.clientHeight,
		l = 0.5; // central line
	
	function centerPanel(elem,pos) {
		//console.log("resizing: "+pos);
		var coco = l;
		if(pos=='right') coco = 1-l;
		var wratio = W*coco/H;
		var cocoxW = coco*W;
		
		// disp W
		var dW = W*coco;
		
		var sel = "."+pos+"#"+pos+"media"+currentIndex[pos];
		//console.log("select:"+sel);
		
		var media = elem.select(sel);
		var thediv = elem.select("div");
		// media info
		var ratio = 	media.attr("sr");
		var height = 	media.attr("sh");
		var typ = 		media.attr("st");
		//console.log("wratio:"+wratio);
		//if(typ=='video') media = elem.select(sel+" video");
		
		elem.style("width",cocoxW);
		elem.style("height",H);
		if(pos=='right') elem.style("left",l*W+"px");
		
		thediv.style("width",cocoxW);
		thediv.style("height",H);
		thediv.style("opacity",0.7-coco);
		//elem.select("div").style("box-shadow",30*coco+"px 0px 50px black");	
		if(pos=='right') thediv.style("left",0+"px");
		
		
		// wanted width and dec based on available space
		var decX = 0,
			decY = 0;
		//console.log(wratio+" < "+ratio);
		if(wratio<ratio) {
			w = ratio*H;
			if(pos=='right') {
				decX = (cocoxW-w)/2;
			} else {
				decX = (cocoxW-w)/2;
			}
		} else {
			w = W*coco;
			decY = (H-w/ratio)/2;
		}
		
		// set sizes
		if(typ=='img') {
			media.style("width",w);
			media.style("left",decX+"px");
			media.style("top",decY+"px");
		}
		if(typ=='video') {
			media.attr("width",w);
			media.attr("height",w/ratio);
			media.style("left",decX+"px");
			media.style("top",decY+"px");
		}
		
	}
	function winResized(pos) {
		try {
			W = w.innerWidth || e.clientWidth || g.clientWidth;
			H = w.innerHeight|| e.clientHeight|| g.clientHeight;
			//console.log("size: "+W+"/"+H);
			if(pos=='left' || pos=='right')
				centerPanel(d3.select("#p"+pos),pos);
			else {
				centerPanel(d3.select("#pleft"),'left');
				centerPanel(d3.select("#pright"),'right');
			}
		} catch(err) { console.log(" - error resizing - : "+pos+" index: "+currentIndex.left+"|"+currentIndex.right) }
	}
	window.onresize = winResized;

	function getImgSize(typ,imgSrc,callb) {
		if(typ=='img') {
			var newImg = new Image();
			newImg.onload = callb;
			newImg.onerror = callb;
			newImg.src = imgSrc;
		} else 
			callb(null);
	}

	function typeWrite(elem,text) {
		text.split('').forEach(function(d,i) {
			setTimeout(function() {
				elem.html(elem.html()+d);
			},50*i);
		});
	}
	
	function addImageBehind(i,line,pos,finished) {
		var path = imagesFold+line['file'];
		var pathaudio = audioFold+line['mp3']+'.mp3';
		var ext = line['file'].split(".")[1];
		console.log("------ Adding file: "+i+"|"+pos+"|"+ext+"|"+path);
		
		var typ = 'img';
		if(ext=='m4v') typ = 'video';
		if(ext=='mp3') typ = 'audio';
		
		getImgSize(typ,path,function(s){
			var s = {'height':this.height,'width':this.width,'ratio':this.width/this.height};
			//console.log("got ratio:"+s.ratio);	
			var agif = d3.select("#p"+pos);
					
			// adding video
			if(typ=='video') {
				var vid = agif.append("video")
					.attr("class",typ+" "+pos)//+" video-js vjs-default-skin")
					.attr("id",pos+"media"+i)
					.attr("sr",1280/720)
					.attr("sh",720)
					.attr("st",typ)
					//.attr("controls","false")
					//.attr("autoplay","autoplay")
					.attr("loop","loop")
					.attr("preload","preload")
					//.attr("muted","muted")
					.style("z-index",1000-i);
				vid.append("source")
					.attr("src",path)
					.attr("type",'video/mp4');
				document.getElementById(pos+"media"+i).volume = 0;
				document.getElementById(pos+"media"+i).pause();
			}
			// adding img/gif "/limage.jpg" + corresponding audio "/limage.superson.jpg"
			if(typ=='img') {
				var im = agif.append("img")
					.attr("src",path)
					.attr("class",typ+" "+pos)
					.attr("id",pos+"media"+i)
					.attr("sr",s.ratio)
					.attr("sh",s.height)
					.attr("st",typ)
					.style("z-index",1000-i);
				// adding audio
				var au = d3.select("body").append("audio")
					.attr("id","audio"+pos+'media'+i)
					.attr("src",pathaudio)
					.attr("loop","loop")
					.attr("autoplay","autoplay");
				document.getElementById("audio"+pos+'media'+i).volume = 0;
				document.getElementById("audio"+pos+'media'+i).pause();
			}
			
			// building bubbles
			if(line['bubbles']) {
				var coco = l;
				if(pos=='right') coco = 1-l;
				var bubbles = line['bubbles'].split("|");
				// ? random  pour pos (nL,i);
				// ? random size pour ligne
				var nB = bubbles.length;
				var indexFont = 0;
				for(e in bubbles) {
					//console.log("In-BUBBLES: "+typ+" "+pos+'media'+i);
					var bvals = null;
					if(bubbles[e].indexOf(';')!=-1)
						bvals = bubbles[e].split(";");
					else {
						var px = 10+Math.random()*W/2;
						var py = 20+e*H*0.9/nB;
						bvals = [px,py,bubbles[e]];
					}
					var ps = 0.85+Math.random()*1.8;
					var tw = Math.min(30+bvals[2].length*8*ps,W*0.7);
					indexFont = pos=='left'? 0 : 1;
					agif.append("div")
						.attr("class","bubble "+"bubble"+pos+i+" font_"+indexFont)
						.style("width", function(d,i){ return tw+"px"; })
						.style("left", function(d,i){ return Math.min(px,W-tw)+"px"; })
						.style("top", function(d,i){ return bvals[1]+"px"; })
						.style("font-size",function(d,i){ return ps+"em"; })
						.style("z-index",1000-i)
						.text(bvals[2]);
						//.each(function(d,i){ typeWrite(d3.select(this),bvals[2]); });
				}
			}
			
			if(i==0) startMedia(pos,0);
			//console.log("added: "+typ+" "+pos+'media'+i);

			nLoaded += 0.5;
			console.log("__ currently loaded: "+nLoaded);
			if(typeof(finished)==='undefined') console.log("(no callback)");
			else finished();
		});
	}

	function setVolume(pos,i,vol) {
		// either video or audio ?
		var selv = pos+"media"+i;
		var sela = "audio"+pos+'media'+i;
		try {document.getElementById(selv).volume = vol;}
		catch(err) {}
		try {document.getElementById(sela).volume = vol;}
		catch(err) {}
		//console.log("volume set: "+pos+"|"+vol+"|"+selv+"|"+sela);
	}	
	function startMedia(pos,i) {
		if(!mute) {
			setVolume('left',i,0.5);
			setVolume('right',i,0.5);
		}
		try {document.getElementById(pos+"media"+i).play();}
		catch(err) {}
		try {document.getElementById("audio"+pos+'media'+i).play();}
		catch(err) {}
	}
	
	// function to move forward !
	function moveForward(pos) {
		if(!killinglock[pos] && currentIndex[pos]<lines[pos].length-1 && nLoaded>currentIndex[pos]+1 ) {
			killinglock[pos] = true;
			console.log("Moving forward: "+pos+"|"+currentIndex[pos]);
			
			startMedia(pos,currentIndex[pos]+1);
			
			// slide out the first image
			var delsel = "."+pos+"#"+pos+"media"+currentIndex[pos];
			var delseb = ".bubble"+pos+currentIndex[pos];
			//console.log("DELETE SELECTION:"+delsel+" "+delseb);
			//d3.select(delsel).remove();
			//thediv.selectAll("div").transition().duration(DURSLIDE).style("opacity",0).remove();
			
			d3.selectAll(delseb).transition().duration(DURSLIDE).style("top",-W)
				.each("end",function(){
					d3.select(delseb).remove();
				});
			d3.select(delsel).transition().duration(DURSLIDE).style("top",-W)
			//d3.select(delsel).transition().duration(DURSLIDE).style("left",pos=='left' ? -2*W*l : W)
				.each("end",function(){
					d3.select(delsel).remove();
					//d3.select(delseb).remove();
					killinglock[pos] = false;
				});
			// remove audio
			try { d3.select("#audio"+pos+'media'+currentIndex[pos]).remove(); }
			catch(err) {}
			currentIndex[pos]+=1;
			winResized(pos);
			var wi = currentIndex[pos]+NLOAD-1;
			if(wi<lines[pos].length) addImageBehind(wi,lines[pos][wi],pos);
			// fade out and kill audio
			
			console.log("__ currently looking index: "+currentIndex.left+"|"+currentIndex.right);
			//killinglock[pos] = false;
		}
	}
	
	function addBothImagesBehind(k,callb) {
		if(k<NLOAD) {
			addImageBehind(k,lines.left[k],'left', function() {
				addImageBehind(k,lines.right[k],'right', function(){
					winResized('both');
					if(nLoaded==1) d3.select('#loading').remove();
					callb(k+1,callb);
				});
			});
		} else 
			console.log("Finished loading "+NLOAD+" images");
	}

	function init(lines) {
		var thebox = d3.select("#"+unikid).style("text-align","center")
			.append("div").attr("class","wrapper")
				.style("width",W)
				.style("height",H)
		
		thebox.append("div").attr("class","panel").attr("id","pleft").style("width",l*W).style("height",H)
			.style("left",0)
			.append("div").attr("class","mask").attr("id","mleft").style("z-index",1007);
		thebox.append("div").attr("class","panel").attr("id","pright").style("width",(1-l)*W).style("height",H)
			.style("left",l*W)
			.append("div").attr("class","mask").attr("id","mright").style("z-index",1007);

	
		// building first layers
		addBothImagesBehind(0,addBothImagesBehind);

		/////////////////////////////////////////////// EVENTS
		// or setting mouse clic to do it manually
		d3.select("#"+unikid+" .wrapper")
			.on("click", function(d,i) {
				moveForward('left');
				moveForward('right');
				//if(coordinates[0]<l*W) moveForward('left');
				//else moveForward('right');
			})
			.on('mousemove', function(){
				if(nLoaded>0) {
					coordinates = d3.mouse(this);
					var mx = coordinates[0];
					var dec = sign(mx/W-0.5)*Math.pow(mx/W-0.5,2);
					//var dec = mx/W-0.5;
					l = Math.min(1,0.5-2.5*dec);
					l = Math.max(l,0);
					//l = 0.5-0.65*dec;
					//console.log(l);
					// setting volumes
					if(!mute) {
						setVolume('left',currentIndex.left,(1-mx/W)*AUDIOCOEFF);
						setVolume('right',currentIndex.right,(mx/W)*AUDIOCOEFF);
					}
					winResized('both');
				}
			});
		document.onkeydown = function(e) {
			e = e || window.event;
			if (e.keyCode == '40') {
				moveForward('left');
				moveForward('right');
			}
		}
		/////////////////////////////////////////////// BUTTONS
		d3.select("#b_mute").on('click',function(e){
			mute = !mute;
			console.log("Mute: "+mute);
			d3.select("#b_mute img").attr("src",mute ? "img/mute_on.png" : "img/mute_off.png");
			if(mute) {
				setVolume('left',currentIndex.left,0);
				setVolume('right',currentIndex.right,0);
			} else {
				setVolume('left',currentIndex.left,0.5);
				setVolume('right',currentIndex.right,0.5);
			}
		});
		d3.select("#b_fullscreen").on('click',function(e){
			var div = document.getElementById("mydiv");
			div.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			div.mozRequestFullScreen();
			div.requestFullscreen(); // Opera
/*
			document.webkitExitFullscreen();
			document.mozCancelFullscreen();
			document.exitFullscreen();
*/
		});
	}
	
	/////////////////////////////////////////////// INIT
	window.onload = function() {
		console.log("Loading data");
		lines = {};
		d3.tsv(basePath+"/media_left.tsv",function(d) {
			lines.left = d;
			d3.tsv(basePath+"/media_right.tsv",function(t) {
				lines.right = t;
				init(lines);
			})
		});
	}
};
