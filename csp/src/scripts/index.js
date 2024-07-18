const plainText = document.querySelector('#plaintext')
const key = document.querySelector('#key')
const chipertext = document.querySelector('#chipertext')
const coverImage = document.querySelector('#coverImage')
const textBefore = document.querySelector('.text-before')
const textAfter = document.querySelector('.text-after')
const stegoImage = document.querySelector('#stegoImage')
const keyDecrypt = document.querySelector('#keyDecrypt')
const textStegoImage = document.querySelector('.textStegoImage')
const resultDecrypt = document.querySelector('#resultDecrypt')
const shiftDecrypt = document.querySelector('.shiftDecrypt')
let resultCoverImage

const canvas = document.getElementById( 'canvas' )
const canvasAfter = document.querySelector('#canvasAfter')
const canvasDecrypt = document.getElementById('canvasDecrypt')
const ctx = canvas.getContext("2d")
const ctxAfter = canvasAfter.getContext("2d")
const ctxDecrypt = canvasDecrypt.getContext("2d")
let clampedArray
let index = 0;

// Function Encrypt

const encryptCrypto = () => {
   setTimeout(() => {
   if(plainText.value === '' || key.value === '') {
      chipertext.value = ''

      return;
   }
   const result = caesarShift(plainText.value, parseInt(key.value))
   chipertext.value = result
   }, 400);
}

var caesarShift = function (str, amount) {
   // Wrap the amount
   if (amount < 0) {
      return caesarShift(str, amount + 26);
   }

   // Make an output variable
   var output = "";

   // Go through each character
   for (var i = 0; i < str.length; i++) {
   // Get the character we'll be appending
   var c = str[i];

   // If it's a letter...
   if (c.match(/[a-z]/i)) {
      // Get its code
      var code = str.charCodeAt(i);
      console.log('code', code)
      // Uppercase letters
      if (code >= 65 && code <= 90) {
         c = String.fromCharCode(((code - 65 + amount) % 26) + 65);
      }

      // Lowercase letters
      else if (code >= 97 && code <= 122) {
         c = String.fromCharCode(((code - 97 + amount) % 26) + 97);
      }
   }

   // Append
   output += c;
   }

   // All done!
   return output;
};

const handleCoverImage = (e) => {
   let extension = coverImage.value.substring(coverImage.value.lastIndexOf('.')  + 1)
   if (extension == "gif" || extension == "png" || extension == "bmp" || extension == "jpeg" || extension == "jpg") {
      if (e.files && e.files[0]) {
         var reader = new FileReader();
         let img = new Image()
         
         reader.onload = function(e) {
            // clean canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            img.src = e.target.result
            checkTextBefore()
         };
         
         reader.onloadend =() => {
            // draw cover image into canvas
            ctx.drawImage( img,  0, 0, img.width, img.height,
                                 0, 0, canvas.width, canvas.height);
         }
      }
      reader.readAsDataURL(coverImage.files[0]);
   }
}

const checkTextBefore = () => {
   if(textBefore.value !== '') {
      return textBefore.innerHTML = 'Before'
   }
   
   return 
}

const checkTextAfter = () => {
   if(textAfter.value !== '') {
      return textAfter.innerHTML = 'After (Click right and save image)'
   }
   return
}

const handleCombine = () => {
   if(plainText.value === '') {
      chipertext.innerHTML = ''
      return alert('Please enter the secret text')
   } else if(key.value === '') {
      chipertext.innerHTML = ''
      return alert('Please input the key')
   } else if(coverImage.value === '') {
      return alert('Please insert image')
   } else if (chipertext.value === '') {
      return alert('Chipertext still empty')
   }


   let extension = coverImage.value.substring(coverImage.value.lastIndexOf('.')  + 1)
   if (extension == "gif" || extension == "png" || extension == "bmp" || extension == "jpeg" || extension == "jpg") {
      checkTextAfter()
      
      // cara baru
      let fr = new FileReader()

      fr.addEventListener('load', console.info('load just start.. wait for finish'))
      fr.addEventListener('loadend', (e) => {
         let img = new Image()
         img.src = e.target.result


         img.onload = function() {
            // get imageData - consist of rgba value for each array index
            clampedArray = ctx.getImageData( 0, 0, canvas.width, canvas.height );
            // start reading & replacing bits
            readByte( arrayBuffer(chipertext.value) );
            //console.log(clampedArray);
            // draw canvas using image data instead or img object
            ctxAfter.putImageData(clampedArray, 0, 0);
         }
      })
      fr.readAsDataURL(coverImage.files[0])
   }
}

// Function Decrypt
const handleStegoImage = (e) => {
   let extension = stegoImage.value.substring(stegoImage.value.lastIndexOf('.')  + 1)
   if (extension == "gif" || extension == "png" || extension == "bmp" || extension == "jpeg" || extension == "jpg") {
      if (e.files && e.files[0]) {
         var reader = new FileReader();
         let img = new Image()
         
         reader.onload = function(e) {
            // clean canvas
            ctxDecrypt.clearRect(0, 0, canvasDecrypt.width, canvasDecrypt.height)
            img.src = e.target.result
         };
         
         reader.onloadend =(e) => {
            // draw cover image into canvas            
            ctxDecrypt.drawImage( img,  0, 0, img.width, img.height,
                                 0, 0, canvasDecrypt.width, canvasDecrypt.height);
            
            shiftDecrypt.style.marginTop = '10px'
            canvasDecrypt.style.minHeight = "220px"
                        
         }

      reader.readAsDataURL(stegoImage.files[0]);
      }
   }
}

const handleDecrypt = () => {
   if(stegoImage.value === '') return alert('upload the stego image first!')
   if(keyDecrypt.value === '') return alert('fill in the key field first!')

   let extension = stegoImage.value.substring(stegoImage.value.lastIndexOf('.')  + 1)
   
   if (extension == "gif" || extension == "png" || extension == "bmp" || extension == "jpeg" || extension == "jpg") {
      if (stegoImage.files && stegoImage.files[0]) {
         var file = stegoImage.files[0];
         console.log('file', file)
         var fr = new FileReader();

         fr.addEventListener( "loadend", loadEndEvent );

         function loadEndEvent ( e ) {

            var img = new Image();
            img.src = e.target.result;
            // wait for image finish load
            // then draw image into canvas
            img.onload = function () {
                  // returned arraybuffer object
                  //var arrayBuffer = evt.target.result;
                  // assign arraybuffer to unsigned int8array instead of normal array
                  // 1 byte per index, and only store to 256 values
                  //var loadView = new Uint8Array(arrayBuffer);
                  var loadView = ctxDecrypt.getImageData( 0, 0, canvasDecrypt.width, canvasDecrypt.height );
                  console.log('load', loadView.data.length )
                  var totalLength = 0;
                  var lastIndex;
               // loop over all the pixel's bit
                  // sum up all the length(secret data's length)
                  for ( var b = 0, viewLength = loadView.data.length; b < viewLength; b++ ) {
                        // get the length for matched index only
                     if (loadView.data[ b ] == 255) {
                        totalLength += loadView.data[ b ];
                        if (loadView.data[ b + 1 ] < 255) {
                              totalLength += loadView.data[ b + 1 ];
                              lastIndex = b + 1;
                              break;
                        }
                     } else {
                        totalLength += loadView.data[ b ];
                        lastIndex = b;
                        break;
                     }
                  }
                  console.info( 'Total length :' + totalLength + ', Last Index : ' + lastIndex )
                     // get first index - secret's length
                  var secretLength = totalLength;
                  // instantiate Unsigned array(8 bit)
                  // divided by 4 as one character code equal to 8bit
                  var newUint8Array = new Uint8Array( totalLength / 4 );
                  var j = 0;
                  // start extracting the bits from pixel
                  for ( var i = ( lastIndex + 1 ); i < secretLength; i = i + 4 ) {
                  // we only need the first 2 bit from each byte
                     // as those 2bits contains our secret data's bit
                     // first, clear the unused bit using mask(3) == 0000 0011
                     // then shifting left for each bit(ordering)
                     // staying at its own location
                     var aShift = ( loadView.data[ i ] & 3 );
                     var bShift = ( loadView.data[ i + 1 ] & 3 ) << 2;
                     var cShift = ( loadView.data[ i + 2 ] & 3 ) << 4;
                     var dShift = ( loadView.data[ i + 3 ] & 3 ) << 6;
                     // final, merge/combine all shifted bits to form a byte(8bits)
                     var result = ( ( ( aShift | bShift) | cShift ) | dShift );
                     // store the result(single byte) into unsigned integer
                     newUint8Array[ j ] = result;
                     j++;
                  }
                  
                  // console.log( newUint8Array )
                  let dec = new TextDecoder()
                  let res = dec.decode(newUint8Array)
                  let shift = Math.sign(keyDecrypt.value) >= 0 ?  parseInt(`-${keyDecrypt.value}`) : parseInt(keyDecrypt.value)
                  const resultDecode = caesarShift(res, shift)
                  console.log('shift', shift)
                  console.log('resultDecode', resultDecode)
                  resultDecrypt.value = resultDecode
            }
         }
         // read as dataUrl(base64)
         fr.readAsDataURL( file );
      }
   }


}

const arrayBuffer = (str) => {
   let enc = new TextEncoder()
   return enc.encode(str)
}

/**
* reading secret's bit for every character set's code
*/
function readByte( secret ) {
   for ( var i = 0, length = secret.length; i < length; i++ ) {

      if ( i == 0 ) {
            // on first bit, store the length of secret data
            // must multiple by 4, as one character's code containing
            // 8bits, thus this 8bits divide by 2. every 2 bits should replace
            // the LSB(Least significant bit) of pixel's byte
            var secretLength = length * 4;
            console.info( 'Secret Length(' + length + 'x4) : ' + secretLength )
            // as our imageData is a typed array(Uint8ClampedArray)
            // it only can store value not more than 256(8bit or 1byte)
            if ( secretLength > 255 ) {
            // check how many times should we need imageData's index
               // to store our secret's length
               var division = secretLength / 255;
               // integer number
               if ( division % 1 === 0 ) {
                  for ( var k = 0; k < division; k++ ) {
                        clampedArray.data[ k ] = 255;
                        index++;
                  }
               }
               // float number
               else {

                  var firstPortion = division.toString().split(".")[ 0 ];
                  var secondPortion = division.toString().split(".")[ 1 ];

                  for ( var k = 0; k < firstPortion; k++ ) {
                        clampedArray.data[ k ] = 255;
                        index++;
                  }

                  var numberLeft = Math.round( ( division - firstPortion ) * 255 );
                  console.info( 'numberLeft : ' + numberLeft )
                  clampedArray.data[ k ] = numberLeft;
                  index++;
               }

            } else {
               clampedArray.data[ 0 ] = secretLength;
               index++;
            }

            console.log( 'sss : ' + clampedArray.data[ 0 ] )

      }

      var asciiCode = secret[ i ];
      // use masking, to clear bit, and take the bit we want only
      // Take only first 2 bit, eg : 0111 0011 => 0000 0011
      var first2bit = ( asciiCode & 0x03 ); // 0x03 = 3
      // Take only first 4 bit(2bit at the end), eg : 0111 0011 => 0000 0000
      var first4bitMiddle = ( asciiCode & 0x0C ) >> 2; // 0x0C = 12, shift to the right 2 bit or divide by 2^2, as we want to take first 2 bit at the end
      // Take only first 6 bit(2bit at the end), eg : 0111 0011 => 0011 0000
      var first6bitMiddle = ( asciiCode & 0x30 ) >> 4; // 0x30 = 48, shift to the right 4 bit or divide by 2^4, as we want to take first 2 bit at the end
      // Take only first 8 bit(2bit at the end), eg : 0111 0011 => 0100 0000
      var first8bitMiddle = ( asciiCode & 0xC0 ) >> 6; // 0xC0 = 192, shift to the right 6 bit or divide by 2^6, as we want to take first 2 bit at the end
      //console.log(i + ' : ' + first2bit);
      //console.log(i + ' : ' + first4bitMiddle);
      //console.log(i + ' : ' + first6bitMiddle);
      //console.log(i + ' : ' + first8bitMiddle);
      // start replacing our secret's bit on LSB
      replaceByte( first2bit );
      replaceByte( first4bitMiddle );
      replaceByte( first6bitMiddle );
      replaceByte( first8bitMiddle );


   }
}

/**
* replace bits for each imageData's byte
*/
function replaceByte ( bits ) {
   // clear the first two bit(LSB) using &
   // and replacing with secret's bit
   clampedArray.data[ index ] = ( clampedArray.data[ index ] & 0xFC ) | bits;
   index++;

}


const reset = () => {
   plainText.value = ''
   key.value = ''
   chipertext.value = ''
   coverImage.value = ''
   textBefore.innerHTML = ''
   textAfter.innerHTML = ''
   ctx.clearRect(0, 0, canvas.width, canvas.height)
   ctxAfter.clearRect(0, 0, canvasAfter.width, canvasAfter.height)
}

const resetDcrypt = () => {
   stegoImage.value = ''
   keyDecrypt.value = ''
   resultDecrypt.value = ''
   ctxDecrypt.clearRect(0, 0, canvasDecrypt.width, canvasDecrypt.height)
   shiftDecrypt.style.marginTop = '-20px'
   canvasDecrypt.style.maxHeight = "0px"
   canvasDecrypt.style.minHeight = "0px"
}