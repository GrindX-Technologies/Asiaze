const fs = require('fs');
// Very basic check: read some bytes from the file to see if it's a PNG and maybe we can extract a pixel?
// Actually just use imagemagick if installed, or sips (macOS built-in)
