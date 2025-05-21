import {Text, View, TouchableOpacity} from 'react-native';
import styled from 'styled-components';

export const OuterContainer = styled(View)`
  display: flex;
  align-items: center;
`;

export const StyledTitle = styled(Text)`
  font-size: 17px;
`;

export const WidgetContainer = styled(View)`
  width: 280px;
  height: 270px;
`;

export const Container = styled(View)`
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;

export const SingleItemContainer = styled(View)`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 3px 0;
`;

export const ColorIcon = styled(View)`
  width: 10px;
  height: 10px;
  background-color: ${props => props.color};
  border-radius: 50%;
  display: inline-block;
`;

export const Label = styled(Text)`
  height: 10px;
  display: inline-block;
  margin-left: 5px;
  ${({isActive}) => `${isActive ? 'font-weight: 600;' : ''}`}
`;

export const DonutChartContainer = styled(View)`
  margin: 20px 40px 0 40px;
`;

export const DonutInnerText = styled(TouchableOpacity)`
  width: 100px;
  height: 65px;
  font-size: 13px;
  position: absolute;
  top: 80px;
  left: 50px;
  text-align: center;
`;
