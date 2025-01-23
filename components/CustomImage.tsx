import Image, { ImageProps } from 'next/image';

const CustomImage = (props: ImageProps) => {
  // Ensure the alt prop is always provided
  const altText = props.alt || ''; // Use an empty string as fallback
  return (
    <Image
      {...props} // Pass all props to the Next.js Image component
      alt={altText} // Ensure the alt prop is always provided
      unoptimized={true} // Automatically apply unoptimized={true}
    />
  );
};

export default CustomImage;