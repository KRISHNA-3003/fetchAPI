const https = require('https');
const fs = require('fs');

// Function to fetch details of a specific Pokémon
function fetchPokemon(pokemon) {
  const url = `https://pokeapi.co/api/v2/pokemon/${pokemon.toLowerCase()}`;

  https.get(url, (res) => {
    let data = '';

    // Check for invalid Pokemon name
    if (res.statusCode === 404) {
      console.error('Invalid Pokémon name. Please provide a valid name.');
      process.exit(1);
    }

    // A chunk of data has been received
    res.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received
    res.on('end', () => {
      try {
        const pokemonDetails = JSON.parse(data);
        console.log(`Name: ${pokemonDetails.name}`);
        console.log(`National Number: ${pokemonDetails.id}`);
        console.log(`Height: ${pokemonDetails.height / 10} m`);
        console.log(`Weight: ${pokemonDetails.weight / 10} kg`);
        console.log(`Base Experience: ${pokemonDetails.base_experience}`);
        console.log('Abilities:');
        pokemonDetails.abilities.forEach(ability => {
          console.log(`- ${ability.ability.name}`);
        });

        // Download and save the official artwork sprite
        const spriteUrl = pokemonDetails.sprites.other['official-artwork'].front_default;
        downloadSprite(spriteUrl);
      } catch (e) {
        console.error('Error parsing response as JSON:', e);
      }
    });

  }).on('error', (err) => {
    console.error('Error fetching data:', err);
  });
}

// Function to download the sprite image
function downloadSprite(url) {
  const file = fs.createWriteStream('sprite.png');
  https.get(url, (res) => {
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Sprite image downloaded and saved as sprite.png');
    });
  }).on('error', (err) => {
    fs.unlink('sprite.png', () => {});
    console.error('Error downloading sprite image:', err);
  });
}

// Ensure one argument is provided
if (process.argv.length !== 3) {
  console.error('Please provide exactly one argument: the name of the Pokémon.');
  process.exit(1);
}

// Call the function with the provided Pokémon name
const pokemonName = process.argv[2];
fetchPokemon(pokemonName);

