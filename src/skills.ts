export class Skills {
  static fortune(): string {
    const fortunes = [
      'Your next commit will be bug-free! 🍀',
      'A clever algorithm approaches... 🔮',
      'Stack Overflow will have the answer you seek. 📚',
      'Beware of merge conflicts ahead! ⚠️',
      'Your code review will go smoothly. ✨',
      'The CI/CD pipeline smiles upon you. 🚀',
      'Today is a good day to refactor. 🔧',
      'A breakthrough insight is near. 💡',
      'Your tests will all pass on the first try! ✅',
      'Rubber duck debugging will serve you well. 🦆',
    ];

    return fortunes[Math.floor(Math.random() * fortunes.length)];
  }

  static trick(): string {
    const tricks = [
      '*spins in a circle* ⭕',
      '*does a backflip* 🤸',
      '*juggles bits and bytes* 🎯',
      '*plays dead... then boots up!* 💀➡️✨',
      '*transforms into a butterfly* 🦋',
      '*teleports behind you* 👻',
      '*moonwalks across the terminal* 🌙',
      '*summons a rainbow* 🌈',
      '*becomes one with the code* 🧘',
      '*performs a victory dance* 🕺',
    ];

    return tricks[Math.floor(Math.random() * tricks.length)];
  }
}
