import {
  RATING_DOMAIN,
  POPULARITY_DOMAIN,
  REVENUE_DOMAIN,
  GENRES_COLORS
} from './constants';

// create an object that has keys from the values of an input array and values of a defaultValue
export const convertArrayToMap = (data, defaultValue) => data.reduce((acc, key) => {
  acc[key] = defaultValue;
  return acc;
}, {});

export function filterYear(data, chosenYear) {
  const year = Number(chosenYear);
  return data.filter(d => (new Date(d.date)).getFullYear() === year);
}

export function matchDomain(name) {
  if (name === 'rating') {
    return RATING_DOMAIN;
  } else if (name === 'popularity') {
    return POPULARITY_DOMAIN;
  }
  return REVENUE_DOMAIN;
}

function groupBy(data, accessorKey) {
  return data.reduce((acc, row) => {
    if (!acc[row[accessorKey]]) {
      acc[row[accessorKey]] = [];
    }
    acc[row[accessorKey]].push(row);
    return acc;
  }, {});
}

function searchGenre(data, genre) {
  const set = groupBy(data, genre);
  if (set.TRUE === undefined) {
    return [];
  }
  return set.TRUE;
}

export function getGenreData(data, selectedGenre) {
  const genres = Object.entries(selectedGenre).filter(d => d[1] === true);
  if (genres.length === 0) {
    return [];
  }
  const changeData = [];
  genres.forEach(d => {
    const result = searchGenre(data, d[0]);
    result.forEach(e => changeData.push(e));
  });
  return changeData;
}

export function colorGenre(data, selectedGenre) {
  const genres = Object.entries(selectedGenre).filter(d => d[1] === true);
  const colors = [];
  genres.forEach(d => {
    if (data[d[0]] === 'TRUE') {
      colors.push(GENRES_COLORS[d[0]]);
    }
  }, []);
  return colors[0];
}

export function hintField(hints) {
  const temp = [];
  const genres = Object.entries(hints).filter(d => d[1] === 'TRUE');
  genres.forEach(d => {
    if (d[0] === 'Horror') {
      temp.push('Horror/Thriller ');
    } else {
      temp.push(`${d[0]} `);
    }
  });
  const hint = [
    {title: 'Title', value: hints.title},
    {title: 'Date', value: hints.date},
    {title: 'Budget', value: hints.budget},
    {title: 'Revenue', value: hints.revenue},
    {title: 'Popularity', value: hints.popularity},
    {title: 'Rating', value: hints.rating},
    {title: 'Raters Count', value: hints.vote_count},
    {title: 'Genres', value: temp}
  ];
  return hint;
}
