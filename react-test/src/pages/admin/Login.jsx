import React from 'react';
import { TextField, Button, Grid, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Login() {
	const navigate = useNavigate();

	const submitHandler = e => {
		e.preventDefault();
		const { target } = e;
		console.log(target.email.value, target.password.value);
		navigate('/metaverse', { replace: true });
	};

	return (
		<Container component="main" maxWidth="xs" style={{ marginTop: '8%' }}>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Typography component="h1" variant="h5">
						로그인
					</Typography>
				</Grid>
			</Grid>
			<Grid item xs={12} mt={2} mb={2}>
				<a
					href="/oauth2/authorization/google"
					style={{ textDecoration: 'none' }}
				>
					<Button
						// component={Link}
						// to="/oauth2/authorization/google"
						type="submit"
						size="large"
						fullWidth
						variant="contained"
						color="warning"
					>
						구글 로그인
					</Button>
				</a>
			</Grid>
			<form noValidate onSubmit={submitHandler}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<TextField
							variant="outlined"
							required
							fullWidth
							id="email"
							name="email"
							label="이메일 주소"
							autoComplete="email"
						/>
					</Grid>
					<Grid item xs={12}>
						<TextField
							variant="outlined"
							required
							fullWidth
							id="password"
							name="password"
							label="패스워드"
							type="password"
							autoComplete="current-password"
						/>
					</Grid>
					<Grid item xs={12}>
						<Button
							type="submit"
							size="large"
							fullWidth
							variant="contained"
							color="primary"
						>
							로그인
						</Button>
					</Grid>
				</Grid>
			</form>
		</Container>
	);
}

export default Login;
