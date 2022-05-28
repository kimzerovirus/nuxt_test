import React from 'react';
import Basic from '../../3D/Basic';
import { useThree } from '../../hooks/useThree';
import { ThreeWrap } from './Test.style';

function Test() {
	const target = useThree(Basic);
	return <ThreeWrap className="test" ref={target} />;
}

export default Test;
