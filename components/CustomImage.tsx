import Image, { ImageProps } from 'next/image';
import { CSSProperties } from 'react';

const CustomImage = (props: ImageProps) => {
  const altText = props.alt || '';

  // Style for the container (no aspect ratio enforcement)
  const containerStyle: CSSProperties = {
    position: 'relative', // Required for fill
    width: props.width || '100%', // Set width
    height: props.height || '100%', // Set height
  };

  // Style for the image
  const imageStyle: CSSProperties = {
    // objectFit: 'contain', // Ensure the image fits within the container without distortion
    width: '100%', // Make the image responsive
    height: '100%', // Make the image responsive
  };

  return (
    <div style={containerStyle} className={props.className}>
      <Image
        {...props}
        alt={altText}
        unoptimized={true}
        // fill // Fill the parent container
        style={imageStyle}
      />
    </div>
  );
};

export default CustomImage;