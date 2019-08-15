//borrowed from https://github.com/Mewte/videojs-logobrand

export default function(options){
  var player = this;

  var defaults = {
    image: '',
    destination: '#'
  };

  var settings = videojs.mergeOptions(defaults, options)

	var link = document.createElement("a");
		link.id = "vjs-logobrand-image-destination";
		link.href = settings.destination;
		link.target = "_blank";

	var image = document.createElement('img');
		image.id = 'vjs-logobrand-image';
		image.src = settings.image;

	link.appendChild(image);
	player.el().appendChild(link);

  return this;
}
