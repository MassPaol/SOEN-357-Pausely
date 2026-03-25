import Svg, { Rect, Text as SvgText } from 'react-native-svg';

export const AppLogo = ({ width = 200 }: { width?: number }) => {
  const scale = width / 300;
  return (
    <Svg width={width} height={60 * scale} viewBox="0 0 300 60">
      <Rect x="0" y="4" width="9" height="34" rx="2.5" fill="#f2a84e" />
      <Rect x="13" y="4" width="9" height="34" rx="2.5" fill="#f2a84e" />
      <SvgText x="32" y="38" fontSize="40" fontWeight="500" fill="#f2a84e">
        p
      </SvgText>
      <SvgText x="57" y="38" fontSize="40" fontWeight="400" fill="#333">
        ausely
      </SvgText>
    </Svg>
  );
};
