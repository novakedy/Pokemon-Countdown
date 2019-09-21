import React, { Component } from 'react';
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	Image,
	TouchableOpacity,
	Linking,
	LayoutAnimation,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import DatePicker from 'react-native-date-picker';
import RNFS from 'react-native-fs';
import Countdown from 'react-native-countdown-component';
import LottieView from 'lottie-react-native';

interface IProps {}

interface IState {
	/// A list of names of Pokemon
	pokemonNames: string[];

	/// The currently selected date for/from the picker.
	selectedDate?: Date;

	/// Whether or not the celebration should play.
	shouldParty: boolean;
}

export default class LoginScreen extends Component<IProps, IState> {
	public constructor(props: IProps) {
		super(props);

		this.state = {
			pokemonNames: [],
			selectedDate: undefined,
			shouldParty: false,
		};

		this._dateDidChange = this._dateDidChange.bind(this);
		this._pokemonNameTapped = this._pokemonNameTapped.bind(this);
		this._countdownDidFinish = this._countdownDidFinish.bind(this);
	}

	public async componentDidMount() {
		// Load the Pokemon list from the CSV file.
		await this._loadPokemonData();

		// Restore the last date the user selected from storage.
		await this._loadLastSelectedDate();
	}

	public render() {
		if (this.state.pokemonNames.length > 0) {
			return this._renderCountdown();
		} else {
			return this._renderLoading();
		}
	}

	private _renderLoading(): JSX.Element {
		return (
			<View style={styles.loadingContainer}>
				<LottieView
					autoPlay={true}
					loop={true}
					source={require('./assets/lottie/4366-game-east-west.json')}
					style={styles.loadingAnimation}
				/>
			</View>
		);
	}

	private _renderCountdown(): JSX.Element {
		const { selectedDate, shouldParty } = this.state;
		const now = new Date();

		let pokemonDisplayComponent: JSX.Element;
		if (selectedDate !== undefined) {
			const pokemonIndex = this._getPokemonIndexForSelectedDate(
				selectedDate,
			);
			const remainingSeconds = this._secondsUntilDate(selectedDate);
			const pokemonName = this._getCurrentPokemonName();
			const imageName = pokemonIndex.toString();
			const pokemonIndexName =
				pokemonIndex === 0 ? '???' : `#${pokemonIndex}`;

			pokemonDisplayComponent = (
				<View>
					<Image
						style={styles.pokemonImage}
						source={{
							uri: imageName,
						}}
					/>

					<TouchableOpacity
						activeOpacity={0.9}
						onPress={this._pokemonNameTapped}
						style={styles.pokemonNameButton}>
						<Text style={styles.pokemonNumber}>
							{pokemonIndexName}
						</Text>

						<Text style={styles.pokemonName}>{pokemonName}</Text>
					</TouchableOpacity>

					<Countdown
						digitStyle={styles.countdownDigits}
						digitTxtStyle={styles.countdownText}
						until={remainingSeconds}
						onFinish={this._countdownDidFinish}
						size={26}
						timeToShow={['D', 'H', 'M', 'S']}
						showSeparator={true}
					/>
				</View>
			);
		}

		const celebrationAnimationComponent = !shouldParty ? (
			undefined
		) : (
			<LottieView
				speed={0.01}
				autoPlay={true}
				loop={true}
				resizeMode={'cover'}
				source={require('./assets/lottie/9158-confetti.json')}
				style={{ width: 400, height: 400, position: 'absolute' }}
			/>
		);

		return (
			<View style={styles.mainView}>
				{pokemonDisplayComponent}

				<SafeAreaView style={styles.safeAreaContainer}>
					<DatePicker
						date={selectedDate || now} // the selected date, or today if it doesn't exist.
						mode={'date'}
						minimumDate={now} // Today is the minimum date
						onDateChange={this._dateDidChange}
					/>
				</SafeAreaView>

				{celebrationAnimationComponent}
			</View>
		);
	}

	private _countdownDidFinish() {
		this._beginCelebration();
	}

	private _pokemonNameTapped() {
		const name = this._getCurrentPokemonName();
		const index = this._getCurrentPokemonIndex();

		// There won't be a URL for the MissingNo Pokemon.
		if (name && index > 0) {
			Linking.openURL(`https://pokemon.fandom.com/wiki/${name}`);
		}
	}

	private _dateDidChange(toDate: Date) {
		// We're counting until the beginning of the selected date, so set it to exactly midnight.
		toDate.setHours(0, 0, 0, 0);

		if (this._indexForDaysUntilDate(toDate) === 0) {
			this._beginCelebration();
		}

		AsyncStorage.setItem('selectedDate', toDate.toString());

		this.setState(_ => ({
			selectedDate: toDate,
		}));

		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
	}

	private _getCurrentPokemonName(): string | undefined {
		const { pokemonNames } = this.state;
		const pokemonIndex = this._getCurrentPokemonIndex();

		if (pokemonIndex === undefined || !pokemonNames.length) {
			return undefined;
		}

		return pokemonNames[pokemonIndex];
	}

	private _getCurrentPokemonIndex(): number | undefined {
		const { selectedDate } = this.state;

		if (!selectedDate) {
			return undefined;
		}

		return this._getPokemonIndexForSelectedDate(selectedDate);
	}

	private _getPokemonIndexForSelectedDate(selectedDate: Date): number {
		const { pokemonNames } = this.state;

		if (!pokemonNames || pokemonNames.length === 0) {
			return 0;
		}

		return this._indexForDaysUntilDate(selectedDate);
	}

	private _indexForDaysUntilDate(toDate: Date): number {
		const { pokemonNames } = this.state;
		const numberOfPokemon = pokemonNames.length;

		const daysRemaining = Math.ceil(
			this._secondsUntilDate(toDate) / 60.0 / 60.0 / 24.0,
		);

		if (daysRemaining >= numberOfPokemon) {
			return 0;
		} else {
			return daysRemaining;
		}
		// return daysRemaining % numberOfPokemon;
	}

	/// The number of seconds between now and the specified date.
	private _secondsUntilDate(toDate: Date): number {
		const now = new Date();

		return Math.ceil((toDate.getTime() - now.getTime()) / 1000.0);
	}

	private async _loadPokemonData() {
		try {
			const data = await RNFS.readFile(
				`${RNFS.MainBundlePath}/pokemon-data.csv`,
				'utf8',
			);

			const names = data.split(',');

			this.setState(_ => ({
				pokemonNames: names,
			}));
		} catch (error) {
			alert(error);
		}
	}

	private async _loadLastSelectedDate() {
		const lastDateString = await AsyncStorage.getItem('selectedDate');

		if (lastDateString) {
			const lastDate = new Date(lastDateString);

			if (lastDate) {
				this.setState(_ => ({
					selectedDate: lastDate,
				}));
			}
		}
	}

	private _beginCelebration() {
		this.setState(_ => ({
			shouldParty: true,
		}));

		setInterval(() => {
			this.setState(_ => ({
				shouldParty: false,
			}));
		}, 3000);
	}
}

const styles = StyleSheet.create({
	celebrationAnimation: {
		flex: 1,
		position: 'absolute',
	},
	container: {
		flex: 1,
	},
	countdownDigits: {
		backgroundColor: '#E65A41',
	},
	countdownText: {
		color: 'white',
	},
	loadingAnimation: {
		height: 200,
		width: 200,
	},
	loadingContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1,
	},
	mainView: {
		alignContent: 'center',
		backgroundColor: '#F6E551',
		flex: 1,
		justifyContent: 'space-between',
	},
	pokemonImage: {
		aspectRatio: 1.333333,
		width: '100%',
	},
	pokemonName: {
		color: '#386ABB',
		fontFamily: 'Pokemon GB',
		fontSize: 32,
		paddingTop: 12,
		textAlign: 'center',
	},
	pokemonNameButton: {
		paddingVertical: 30,
	},
	pokemonNumber: {
		color: '#386ABB',
		fontFamily: 'Pokemon GB',
		fontSize: 32,
		paddingTop: 6,
		textAlign: 'center',
	},
	safeAreaContainer: {
		alignItems: 'center',
	},
});
