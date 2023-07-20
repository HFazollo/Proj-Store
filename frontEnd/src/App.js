import React from 'react';
import axios from 'axios';
import './App.css';


class App extends React.Component {
	state = {
		productList: [],
		name: '',
		quantity: '',
		price: '',
		qrCodeBase64: '',
		username: '',
		password: '',
		token: ''
	}

	componentDidMount() {
		this.fetchProductList();
	}

	handleInputChange = (event) => {
		const { name, value } = event.target;
		this.setState({ [name]: value });
	}

	handleLoginFormSubmit = (event) => {
		event.preventDefault();

		const { username, password } = this.state;

		// Fazer a requisição de login para o backend
		axios.post('http://localhost:3030/auth', { username, password })
			.then(response => {
				const token = response.data.token;
				this.setState({ token }, () => {
					this.fetchProductList();
					this.setState({ username: '', password: '' });
				});
			}).catch(error => {
				console.log('Erro no login:', error);
			});
	}

	fetchProductList = () => {
		const { token } = this.state;
		let url = "http://localhost:3030/products";
		axios.get(url, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		}).then(response => {
			const productList = response.data;
			this.setState({ productList });
		}).catch(error => {
			console.log(error.toString());
		});
	}

	handleFormSubmit = (event) => {
		event.preventDefault();

		const { name, quantity, price, token } = this.state;
		const productData = {
			name,
			quantity: parseInt(quantity),
			price: parseInt(price)
		};

		let url = "http://localhost:3030/products";
		axios.post(url, productData, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		}).then(response => {
			console.log(response.data);
			this.fetchProductList();
			this.setState({ name: '', quantity: '', price: '' });
		}).catch(error => {
			console.log(error.toString());
		});
	}

	handleDelete = (productId) => {
		const { token } = this.state;
		let url = `http://localhost:3030/products/${productId}`;
		axios.delete(url, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		}).then(response => {
			console.log(response.data);
			this.fetchProductList();
		}).catch(error => {
			console.log(error.toString());
		});
	}

	handleShowQRCode = () => {
		const { token } = this.state;
		let url = "http://localhost:3030/qrcode";
		axios.get(url, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		}).then(response => {
			const qrCodeBase64 = response.data.qrCode;
			this.setState({ qrCodeBase64 });
		}).catch(error => {
			console.log(error.toString());
		});
	};

	render() {
		const { productList, name, quantity, price, qrCodeBase64 } = this.state;

		return (
			<div id="container">
				<div id="login">
					<h2>Login</h2>
					<form onSubmit={this.handleLoginFormSubmit}>
						<div>
							<label htmlFor="username">Usuário: </label>
							<input style={{ marginLeft: "10px", marginBottom: "5px" }} type="text" id="username" name="username" value={this.state.username} onChange={this.handleInputChange} />
						</div>
						<div>
							<label htmlFor="password">Senha: </label>
							<input style={{ marginLeft: "21px" }} type="password" id="password" name="password" value={this.state.password} onChange={this.handleInputChange} />
						</div>
						<br />
						<button type="submit">Login</button>
					</form>
				</div>

				<div id="adicionar">
					<h2>Adicionar Produto</h2>
					<form onSubmit={this.handleFormSubmit}>
						<div>
							<label htmlFor="name">Nome: </label>
							<input style={{ marginLeft: "55px", marginBottom: "5px" }} type="text" id="name" name="name" value={name} onChange={this.handleInputChange} />
						</div>
						<div>
							<label htmlFor="quantity">Quantidade: </label>
							<input style={{ marginLeft: "20px", marginBottom: "5px" }} type="number" id="quantity" name="quantity" value={quantity} onChange={this.handleInputChange} />
						</div>
						<div>
							<label htmlFor="price">Preço: </label>
							<input style={{ marginLeft: "58px" }} type="number" id="price" name="price" value={price} onChange={this.handleInputChange} />
						</div>
						<br />
						<button style={{ marginLeft: "102px" }} type="submit">Adicionar</button>
					</form>
					<h2 style={{ marginTop: "40px" }}>Lista de Produtos</h2>
					<table style={{ border: "1px solid black", padding: "5px 8px 8px 8px" }}>
						<tbody>
							<tr>
								<th style={{ padding: "10px" }}>Nome</th>
								<th style={{ padding: "10px" }}>Quantidade</th>
								<th style={{ padding: "10px" }}>Preço</th>
							</tr>
							{productList.map((product) => (
								<tr style={{ padding: "10px, 5px, 10px, 5px" }} key={product._id}>
									<td style={{ paddingRight: "10px" }}>{product.name}</td>
									<td style={{ paddingLeft: "10px" }}>{product.quantity}</td>
									<td style={{ paddingLeft: "10px" }}>{product.price}</td>
									<td><button onClick={() => this.handleDelete(product._id)}>Deletar</button></td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div id="qrcode">
					<h2>QR Code</h2>
					<button onClick={this.handleShowQRCode}>Gerar QR Code</button>
					{qrCodeBase64 ? (
						<div>
							<img src={`data:image/png;base64,${qrCodeBase64}`} alt="QR Code" />
						</div>
					) : null}
				</div>

				<section class="stage">
					<figure class="ball">
						<span class="shadow"></span>
						<span class="iris"></span>
					</figure>
				</section>


			</div>
		);
	}
}

export default App;
