import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/admin/Login';
import Test from './pages/meataverse/Test';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/metaverse" element={<Test />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
