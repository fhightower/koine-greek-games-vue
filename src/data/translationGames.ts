export interface TranslationSentence {
  greek: string
  english: string
}

export interface TranslationLesson {
  gameId: string
  // Path segment under /translate/… and the route name.
  slug: string
  // Shown on the Home menu and as the in-game heading.
  title: string
  // Short note on what the lesson drills (kept out of the title per request).
  topic: string
  sentences: TranslationSentence[]
}

// Greek → English translation drills taken verbatim from the Exercise I
// (Greek) sections of Machen, New Testament Greek for Beginners. The English
// renderings are deliberately literal so the learner can check word-for-word.
export const translationLessons: TranslationLesson[] = [
  {
    gameId: 'lesson-3-translation',
    slug: 'lesson-3',
    title: 'Lesson III',
    topic: 'Present Active Indicative (§23)',
    sentences: [
      { greek: 'βλέπεις', english: 'you see' },
      { greek: 'γινώσκεις', english: 'you know' },
      { greek: 'λαμβάνεις', english: 'you take (receive)' },
      { greek: 'γράφει', english: 'he writes' },
      { greek: 'ἔχει', english: 'he has' },
      { greek: 'λέγει', english: 'he says' },
      { greek: 'λύει', english: 'he looses' },
      { greek: 'διδάσκει', english: 'he teaches' },
      { greek: 'βλέπει', english: 'he sees' },
      { greek: 'λαμβάνομεν', english: 'we take (receive)' },
      { greek: 'ἔχομεν', english: 'we have' },
      { greek: 'γινώσκομεν', english: 'we know' },
      { greek: 'βλέπετε', english: 'you (pl.) see' },
      { greek: 'λέγετε', english: 'you (pl.) say' },
      { greek: 'γράφετε', english: 'you (pl.) write' },
      { greek: 'διδάσκουσι', english: 'they teach' },
      { greek: 'λαμβάνουσι', english: 'they take (receive)' },
      { greek: 'λύουσι', english: 'they loose' },
      { greek: 'γινώσκετε', english: 'you (pl.) know' },
      { greek: 'βλέπουσι', english: 'they see' },
      { greek: 'ἔχεις', english: 'you have' },
    ],
  },
  {
    gameId: 'lesson-4-translation',
    slug: 'lesson-4',
    title: 'Lesson IV',
    topic: 'The Second Declension (§45)',
    sentences: [
      { greek: 'ἀδελφὸς βλέπει ἄνθρωπον.', english: 'A brother sees a man.' },
      { greek: 'δοῦλος γράφει λόγους.', english: 'A servant writes words.' },
      { greek: 'ἀπόστολοι διδάσκουσιν ἄνθρωπον.', english: 'Apostles teach a man.' },
      { greek: 'ἀπόστολοι λύουσι δούλους.', english: 'Apostles loose servants.' },
      { greek: 'δοῦλος λαμβάνει δῶρα.', english: 'A servant receives gifts.' },
      { greek: 'λαμβάνουσιν υἱοὶ οἴκους.', english: 'Sons receive houses.' },
      {
        greek: 'δούλους καὶ οἴκους λαμβάνουσιν ἀδελφοί.',
        english: 'Brothers receive servants and houses.',
      },
      { greek: 'βλέπομεν ἱερὰ καὶ ἀποστόλους.', english: 'We see temples and apostles.' },
      { greek: 'δούλους βλέπετε καὶ ἀδελφούς.', english: 'You see servants and brothers.' },
      { greek: 'γράφεις λόγον ἀποστόλῳ.', english: 'You write a word to an apostle.' },
      { greek: 'διδάσκει ἄνθρωπον.', english: 'He teaches a man.' },
      {
        greek: 'ἀδελφὸς λέγει λόγον ἀποστόλῳ.',
        english: 'A brother says a word to an apostle.',
      },
      {
        greek: 'ἀδελφὸς ἀποστόλων γινώσκει νόμον.',
        english: 'A brother of apostles knows a law.',
      },
      {
        greek: 'δοῦλοι γινώσκουσι νόμον καὶ λαμβάνουσι δῶρα.',
        english: 'Servants know a law and receive gifts.',
      },
      { greek: 'γινώσκουσιν ἄνθρωποι θάνατον.', english: 'Men know death.' },
      {
        greek: 'λαμβάνομεν δῶρα καὶ ἔχομεν ἀδελφούς.',
        english: 'We receive gifts and have brothers.',
      },
      {
        greek: 'ἀποστόλοις καὶ δούλοις λέγομεν λόγους θανάτου.',
        english: 'To apostles and servants we say words of death.',
      },
      {
        greek: 'ἀδελφοὶ καὶ δοῦλοι γινώσκουσιν καὶ βλέπουσιν ἱερὰ καὶ δῶρα.',
        english: 'Brothers and servants know and see temples and gifts.',
      },
      {
        greek: 'γράφει ἀπόστολος νόμον καὶ λέγει λόγους υἱοῖς δούλου.',
        english: 'An apostle writes a law and says words to the sons of a servant.',
      },
      {
        greek: 'υἱοὶ ἀποστόλων λέγουσι λόγους καὶ λύουσι δούλους.',
        english: 'Sons of apostles say words and loose servants.',
      },
    ],
  },
  {
    gameId: 'lesson-5-translation',
    slug: 'lesson-5',
    title: 'Lesson V',
    topic: 'The First Declension (§59)',
    sentences: [
      { greek: 'ψυχὴ βλέπει ζωήν.', english: 'A soul sees life.' },
      { greek: 'βασιλεία γινώσκει ἀλήθειαν.', english: 'A kingdom knows truth.' },
      {
        greek: 'ἄνθρωπος γράφει ἐντολὰς καὶ νόμους.',
        english: 'A man writes commandments and laws.',
      },
      {
        greek: 'ἀπόστολοι λαμβάνουσι δούλους καὶ δῶρα καὶ ἐκκλησίας.',
        english: 'Apostles receive servants and gifts and churches.',
      },
      {
        greek: 'ἀπόστολοι καὶ ἐκκλησίαι βλέπουσι ζωὴν καὶ θάνατον.',
        english: 'Apostles and churches see life and death.',
      },
      {
        greek: 'υἱὸς δούλου λέγει παραβολὴν ἐκκλησίᾳ.',
        english: 'A son of a servant says a parable to a church.',
      },
      {
        greek: 'παραβολὴν λέγομεν καὶ ἐντολὴν καὶ νόμον.',
        english: 'We say a parable and a commandment and a law.',
      },
      { greek: 'βασιλείας γινώσκετε καὶ ἐκκλησίας.', english: 'You know kingdoms and churches.' },
      {
        greek: 'ἐκκλησίαν διδάσκει ἀπόστολος καὶ βασιλείαν δοῦλος.',
        english: 'An apostle teaches a church, and a servant a kingdom.',
      },
      {
        greek: 'νόμον καὶ παραβολὴν γράφει ἄνθρωπος ἐκκλησίᾳ.',
        english: 'A man writes a law and a parable to a church.',
      },
      {
        greek: 'καρδίαι ἀνθρώπων ἔχουσι ζωὴν καὶ εἰρήνην.',
        english: 'Hearts of men have life and peace.',
      },
      {
        greek: 'φωνὴ ἀποστόλων διδάσκει ψυχὰς δούλων.',
        english: 'A voice of apostles teaches souls of servants.',
      },
      { greek: 'ὥρα ἔχει δόξαν.', english: 'An hour has glory.' },
      {
        greek: 'φωναὶ ἐκκλησιῶν διδάσκουσι βασιλείας καὶ ἀνθρώπους.',
        english: 'Voices of churches teach kingdoms and men.',
      },
      { greek: 'βλέπεις δῶρα καὶ δόξαν.', english: 'You see gifts and glory.' },
      { greek: 'γράφει ἐκκλησίᾳ λόγον ζωῆς.', english: 'He writes a word of life to a church.' },
      {
        greek: 'λέγει καρδίαις ἀνθρώπων παραβολὴν καὶ νόμον.',
        english: 'He says a parable and a law to hearts of men.',
      },
      {
        greek: 'γράφει ἐκκλησίᾳ υἱὸς ἀποστόλου.',
        english: 'A son of an apostle writes to a church.',
      },
    ],
  },
  {
    gameId: 'lesson-6-translation',
    slug: 'lesson-6',
    title: 'Lesson VI',
    topic: 'The Article. Adjectives (§76)',
    sentences: [
      {
        greek: 'ἀγαθὴ ἡ ἐκκλησία καὶ ἡ βασιλεία κακή.',
        english: 'The church is good and the kingdom bad.',
      },
      {
        greek: 'ἡ κακὴ καρδία τῶν ἀνθρώπων γινώσκει θάνατον.',
        english: 'The evil heart of men knows death.',
      },
      {
        greek: 'οἱ ἀπόστολοι βλέπουσι τοὺς μικροὺς οἴκους καὶ τὰς κακὰς ὁδούς.',
        english: 'The apostles see the little houses and the evil ways.',
      },
      {
        greek: 'οἱ δοῦλοι οἱ κακοὶ λύουσι τὸν οἶκον τοῦ ἀποστόλου.',
        english: 'The evil servants destroy the house of the apostle.',
      },
      { greek: 'οἱ κακοὶ λύουσι τὸ ἱερόν.', english: 'The evil men destroy the temple.' },
      {
        greek: 'ὁ κύριος τῆς ζωῆς ἐγείρει τοὺς νεκρούς.',
        english: 'The Lord of life raises the dead.',
      },
      {
        greek: 'οἱ λόγοι τῆς ἀληθείας διδάσκουσι τοὺς ἄλλους ἀποστόλους.',
        english: 'The words of truth teach the other apostles.',
      },
      {
        greek: 'οἱ δίκαιοι λαμβάνουσι τὰ δῶρα τοῦ κυρίου τὰ καλά.',
        english: 'The righteous receive the good gifts of the Lord.',
      },
      {
        greek: 'ὁ κακὸς βλέπει τὴν ἔρημον καὶ τοὺς ἐσχάτους οἴκους.',
        english: 'The evil man sees the desert and the last houses.',
      },
      {
        greek: 'πρῶτοι οἱ δοῦλοι· ἔσχατοι οἱ κύριοι.',
        english: 'The servants are first; the lords are last.',
      },
      {
        greek: 'τῇ ἐκκλησίᾳ τῇ μικρᾷ γράφει ὁ κύριος λόγον ἀγαθόν.',
        english: 'To the little church the Lord writes a good word.',
      },
      { greek: 'τοὺς πιστοὺς βλέπει ὁ πιστός.', english: 'The faithful man sees the faithful.' },
      {
        greek: 'ἔσχατοι οἱ δοῦλοι οἱ κακοί· πρῶτοι οἱ υἱοὶ οἱ ἀγαθοί.',
        english: 'The evil servants are last; the good sons are first.',
      },
      {
        greek: 'ὁ υἱὸς τοῦ ἐσχάτου ἀδελφοῦ βλέπει τὰς καλὰς ἐκκλησίας τοῦ κυρίου.',
        english: 'The son of the last brother sees the good churches of the Lord.',
      },
      {
        greek: 'ἄλλην παραβολὴν λέγομεν τῇ κακῇ βασιλείᾳ.',
        english: 'We say another parable to the evil kingdom.',
      },
      {
        greek: 'πρώτη ἡ ἐκκλησία· ἐσχάτη ἡ ἄλλη βασιλεία.',
        english: 'The church is first; the other kingdom is last.',
      },
      {
        greek: 'ταῖς πισταῖς λέγει ὁ κύριος παραβολὴν καλὴν καὶ τοῖς πιστοῖς.',
        english: 'To the faithful women the Lord says a good parable, and to the faithful men.',
      },
      {
        greek: 'ὁ ἀγαθὸς γράφει ἀγαθά· ὁ κακὸς κακά.',
        english: 'The good man writes good things; the evil man evil things.',
      },
      {
        greek: 'ἀγαθὸς ὁ δοῦλος καὶ λέγει καλά.',
        english: 'The servant is good and says good things.',
      },
      {
        greek: 'ἡ ἀλήθεια πιστὴ καὶ ἡ ὥρα κακή.',
        english: 'The truth is faithful and the hour is evil.',
      },
    ],
  },
  {
    gameId: 'lesson-7-translation',
    slug: 'lesson-7',
    title: 'Lesson VII',
    topic: 'First-Declension Masculines. Prepositions (§89)',
    sentences: [
      {
        greek: 'οἱ μαθηταὶ τῶν προφητῶν μένουσιν ἐν τῷ κόσμῳ.',
        english: 'The disciples of the prophets remain in the world.',
      },
      {
        greek: 'οἱ κακοὶ βάλλουσιν λίθους εἰς τὸν οἶκον τῶν μαθητῶν.',
        english: 'The evil men throw stones into the house of the disciples.',
      },
      {
        greek: 'ὁ θεὸς πέμπει τοὺς ἀγγέλους εἰς τὸν κόσμον.',
        english: 'God sends the angels into the world.',
      },
      {
        greek: 'ὁ προφήτης πέμπει τοὺς μαθητὰς τοῦ κυρίου ἐκ τῶν οἴκων εἰς τὴν ἐκκλησίαν.',
        english: 'The prophet sends the disciples of the Lord out of the houses into the church.',
      },
      {
        greek: 'ὁ θεὸς ἐγείρει τοὺς νεκροὺς ἐκ θανάτου.',
        english: 'God raises the dead out of death.',
      },
      {
        greek: 'λαμβάνετε τὰ καλὰ δῶρα ἀπὸ τῶν τέκνων.',
        english: 'You receive the good gifts from the children.',
      },
      { greek: 'ἄγομεν τὰ τέκνα ἐκ τῶν οἴκων.', english: 'We lead the children out of the houses.' },
      {
        greek: 'μετὰ τοὺς ἀγγέλους πέμπει ὁ θεὸς τὸν υἱόν.',
        english: 'After the angels God sends the Son.',
      },
      {
        greek: 'μετὰ τῶν ἀγγέλων ἄγει ὁ κύριος τοὺς δικαίους εἰς τὸν οὐρανόν.',
        english: 'With the angels the Lord leads the righteous into heaven.',
      },
      {
        greek: 'διὰ τῶν ὁδῶν τῆς ἐρήμου φέρουσιν οἱ δοῦλοι τὰ δῶρα εἰς ἄλλον τόπον.',
        english: 'Through the ways of the desert the servants bring the gifts into another place.',
      },
      {
        greek: 'διὰ τῶν γραφῶν τῶν προφητῶν γινώσκομεν τὸν κύριον.',
        english: 'Through the writings of the prophets we know the Lord.',
      },
      {
        greek: 'διὰ τὴν δόξαν τοῦ θεοῦ ἐγείρει ὁ κύριος τοὺς νεκρούς.',
        english: 'On account of the glory of God the Lord raises the dead.',
      },
      {
        greek: 'φέρουσιν τοὺς νεκροὺς εἰς τὴν ἔρημον.',
        english: 'They bring the dead into the desert.',
      },
      {
        greek: 'οἱ μαθηταὶ διδάσκουσι τὰ ἀγαθὰ τέκνα ἐν τῇ ἐκκλησίᾳ.',
        english: 'The disciples teach the good children in the church.',
      },
      {
        greek: 'ὁ κύριος λέγει παραβολὴν τοῖς μαθηταῖς ἐν τῷ ἱερῷ.',
        english: 'The Lord says a parable to the disciples in the temple.',
      },
      {
        greek: 'διὰ τὴν ἀλήθειαν βλέπουσιν οἱ προφῆται τὸν θάνατον.',
        english: 'On account of the truth the prophets see death.',
      },
      {
        greek:
          'ἀπὸ τῆς ἐρήμου ἄγουσιν οἱ μαθηταὶ τοὺς ἀγαθοὺς δούλους καὶ τοὺς υἱοὺς τῶν προφητῶν πρὸς τοὺς μικροὺς οἴκους τῶν μαθητῶν.',
        english:
          'From the desert the disciples lead the good servants and the sons of the prophets to the little houses of the disciples.',
      },
      {
        greek: 'διὰ τὴν βασιλείαν τοῦ θεοῦ φέρομεν τὰ κακά.',
        english: 'On account of the kingdom of God we bear the evil things.',
      },
      {
        greek: 'διὰ τὰς ψυχὰς τῶν ἀδελφῶν βλέπει κακά.',
        english: 'On account of the souls of the brothers he sees evil things.',
      },
      { greek: 'καλὸς ὁ οὐρανός· κακὸς ὁ κόσμος.', english: 'Heaven is good; the world is evil.' },
    ],
  },
  {
    gameId: 'lesson-8-translation',
    slug: 'lesson-8',
    title: 'Lesson VIII',
    topic: 'Enclitics. Personal Pronouns. εἰμί (§100)',
    sentences: [
      {
        greek: 'οἱ μαθηταί σου γινώσκουσι τὴν βασιλείαν καὶ ἄγουσι τοὺς ἀδελφοὺς αὐτῶν εἰς αὐτήν.',
        english: 'Your disciples know the kingdom and lead their brothers into it.',
      },
      {
        greek: 'διδάσκω τοὺς ἀδελφούς μου καὶ λέγω αὐτοῖς παραβολήν.',
        english: 'I teach my brothers and say a parable to them.',
      },
      {
        greek: 'ἄγει με ὁ κύριος πρὸς τοὺς μαθητὰς αὐτοῦ.',
        english: 'The Lord leads me to his disciples.',
      },
      {
        greek: 'δι’ ἐμὲ βλέπεις σὺ τὸν θάνατον, σοὶ δὲ ἐγὼ λέγω λόγους κακούς.',
        english: 'On account of me you see death, but to you I say evil words.',
      },
      {
        greek: 'διὰ σοῦ ἄγει ὁ θεὸς τοὺς πιστοὺς εἰς τὴν βασιλείαν αὐτοῦ καὶ δι’ αὐτῶν τοὺς ἄλλους.',
        english: 'Through you God leads the faithful into his kingdom, and through them the others.',
      },
      {
        greek: 'δι’ ἡμᾶς μένει ὁ κύριος ἐν τῷ κόσμῳ.',
        english: 'On account of us the Lord remains in the world.',
      },
      { greek: 'ἐγώ εἰμι δοῦλος, σὺ δὲ ἀπόστολος.', english: 'I am a servant, but you are an apostle.' },
      {
        greek: 'ἀγαθός ἐστιν ὁ κύριος καὶ ἀγαθοί ἐστε ὑμεῖς.',
        english: 'The Lord is good and you are good.',
      },
      {
        greek: 'μαθηταί ἐστε τοῦ κυρίου καὶ ἀδελφοὶ τῶν ἀποστόλων αὐτοῦ.',
        english: 'You are disciples of the Lord and brothers of his apostles.',
      },
      {
        greek: 'ὁ ἀπόστολος πιστός ἐστιν, οἱ δὲ δοῦλοι αὐτοῦ κακοί.',
        english: 'The apostle is faithful, but his servants are evil.',
      },
      {
        greek: 'ἡ ἐκκλησία πιστή ἐστιν, ἡμεῖς δὲ βλέπομεν αὐτήν.',
        english: 'The church is faithful, and we see it.',
      },
      {
        greek: 'βλέπομέν σε καὶ λέγομέν σοι παραβολήν.',
        english: 'We see you and say a parable to you.',
      },
      { greek: 'δοῦλοι ἐσμέν, δούλους δὲ διδάσκομεν.', english: 'We are servants, but we teach servants.' },
      {
        greek: 'οἱ δοῦλοι ἡμῶν βλέπουσιν ἡμᾶς, ἡμεῖς δὲ διδάσκομεν αὐτούς.',
        english: 'Our servants see us, and we teach them.',
      },
      {
        greek: 'ἀφ’ ὑμῶν λαμβάνει ὁ ἀδελφός μου δῶρα καλά, καὶ πέμπει αὐτὰ πρός με διὰ τῶν δούλων αὐτοῦ.',
        english: 'From you my brother receives good gifts, and sends them to me through his servants.',
      },
      {
        greek: 'γινώσκομεν τὴν ὁδόν, καὶ δι’ αὐτῆς ἄγομέν σε εἰς τὸν οἶκον ἡμῶν.',
        english: 'We know the way, and through it we lead you into our house.',
      },
      {
        greek: 'μετὰ τῶν ἀδελφῶν ἡμῶν βλέπομεν τοὺς μαθητὰς τοῦ κυρίου ἡμῶν.',
        english: 'With our brothers we see the disciples of our Lord.',
      },
      {
        greek: 'μετὰ τὰς ἡμέρας τὰς κακὰς βλέπομεν τὴν βασιλείαν τοῦ κυρίου ἡμῶν.',
        english: 'After the evil days we see the kingdom of our Lord.',
      },
      { greek: 'μεθ’ ἡμῶν βλέπεις αὐτόν.', english: 'With us you see him.' },
      { greek: 'μεθ’ ὑμῶν ἐσμεν ἐν τοῖς οἴκοις ὑμῶν.', english: 'With you we are in your houses.' },
    ],
  },
  {
    gameId: 'lesson-9-translation',
    slug: 'lesson-9',
    title: 'Lesson IX',
    topic: 'Demonstratives. Further Uses of αὐτός (§107)',
    sentences: [
      {
        greek: 'οὗτοι οἱ διδάσκαλοι κρίνουσιν αὐτὸν τὸν ἀπόστολον.',
        english: 'These teachers judge the apostle himself.',
      },
      {
        greek: 'ὁ δὲ αὐτὸς διδάσκαλος ἔχει τὴν αὐτὴν χαρὰν ἐν τῇ καρδίᾳ αὐτοῦ.',
        english: 'And the same teacher has the same joy in his heart.',
      },
      {
        greek: 'νῦν λαμβάνω αὐτὸς τὸ αὐτὸ εὐαγγέλιον ἀπὸ τοῦ κυρίου μου.',
        english: 'Now I myself receive the same gospel from my Lord.',
      },
      {
        greek: 'οὗτος βλέπει ἐκεῖνον καὶ κρίνει αὐτόν.',
        english: 'This man sees that man and judges him.',
      },
      {
        greek: 'μετὰ ταῦτα ἔχετε αὐτοὶ τὴν ἀγάπην τοῦ κυρίου ἐν ταῖς καρδίαις ὑμῶν.',
        english: 'After these things you yourselves have the love of the Lord in your hearts.',
      },
      {
        greek: 'οὗτοι ἔχουσι χαράν, ἐκεῖνοι δὲ ἔχουσιν ἁμαρτίαν.',
        english: 'These have joy, but those have sin.',
      },
      {
        greek: 'αὕτη δέ ἐστιν ἡ φωνὴ τοῦ κυρίου αὐτοῦ.',
        english: 'And this is the voice of his Lord.',
      },
      {
        greek: 'οὕτως γινώσκομεν τοῦτον καὶ βλέπομεν τὸ πρόσωπον αὐτοῦ.',
        english: 'Thus we know this man and see his face.',
      },
      {
        greek: 'λαμβάνομεν ταῦτα τὰ δῶρα ἀπὸ τοῦ αὐτοῦ καὶ βλέπομεν αὐτόν.',
        english: 'We receive these gifts from the same man and see him.',
      },
      {
        greek: 'αὐτὸς βαπτίζεις ἐκεῖνον καὶ εἶ ἀδελφὸς αὐτοῦ.',
        english: 'You yourself baptize that man and are his brother.',
      },
      {
        greek: 'εἰς τὴν αὐτὴν ἐκκλησίαν ἄγομεν τούτους τοὺς διδασκάλους ἡμῶν τοὺς ἀγαθούς.',
        english: 'Into the same church we lead these good teachers of ours.',
      },
      {
        greek: 'αὐτὸς ἐγὼ ἔχω ταύτην τὴν ἐπαγγελίαν τοῦ κυρίου μου.',
        english: 'I myself have this promise of my Lord.',
      },
      {
        greek: 'αὕτη βλέπει τὸ πρόσωπον τοῦ κυρίου αὐτῆς.',
        english: 'This woman sees the face of her Lord.',
      },
      { greek: 'αὐτὴ γινώσκει αὐτὴν τὴν ἀλήθειαν.', english: 'She herself knows the truth itself.' },
      {
        greek: 'ἀγαθή ἐστιν ἡ ἐπαγγελία σου καὶ ἀγαθὴ εἶ αὐτή.',
        english: 'Your promise is good and you yourself are good.',
      },
      {
        greek: 'ἐκεῖνοί εἰσιν μαθηταὶ τοῦ αὐτοῦ διδασκάλου.',
        english: 'Those are disciples of the same teacher.',
      },
      {
        greek: 'οὗτός ἐστιν διδάσκαλος ἐκείνου, ἐκεῖνος δὲ τούτου.',
        english: 'This man is the teacher of that one, and that one of this one.',
      },
      {
        greek: 'οὗτος διδάσκει τοὺς ἀγαθοὺς καὶ αὐτός ἐστιν ἀγαθός.',
        english: 'This man teaches the good and he himself is good.',
      },
      {
        greek: 'μετὰ τὰς ἡμέρας ἐκείνας διδάσκαλοί ἐσμεν τούτων τῶν δούλων.',
        english: 'After those days we are teachers of these servants.',
      },
      {
        greek: 'μετὰ τῶν πιστῶν ἔχομεν ἐπαγγελίας ἀγαθάς, οἱ δὲ πονηροὶ βλέπουσιν ἡμέρας κακάς.',
        english: 'With the faithful we have good promises, but the evil see evil days.',
      },
    ],
  },
  {
    gameId: 'section-120-translation',
    slug: 'lesson-10',
    title: 'Lesson X',
    topic: 'Present Middle and Passive Indicative (§120)',
    sentences: [
      {
        greek: 'λύονται οὗτοι οἱ δοῦλοι ὑπὸ τοῦ κυρίου.',
        english: 'These servants are being loosed by the lord.',
      },
      {
        greek: 'τῷ λόγῳ τοῦ κυρίου ἀγόμεθα εἰς τὴν ἐκκλησίαν τοῦ θεοῦ.',
        english: 'By the word of the lord we are being led into the church of God.',
      },
      {
        greek: 'οὐκ ἀκούετε τῆς φωνῆς τοῦ προφήτου, ἀλλ’ ἐξέρχεσθε ἐκ τοῦ οἴκου αὐτοῦ.',
        english: 'You do not hear the voice of the prophet, but you are going out of his house.',
      },
      {
        greek: 'τῷ λόγῳ αὐτοῦ τοῦ κυρίου γίνεσθε μαθηταὶ αὐτοῦ.',
        english: 'By the word of the lord himself you are becoming his disciples.',
      },
      {
        greek: 'ἐκεῖνοι οἱ ἀγαθοὶ διδάσκαλοι οὐκ εἰσέρχονται εἰς τοὺς οἴκους τῶν ἁμαρτωλῶν.',
        english: 'Those good teachers do not enter into the houses of the sinners.',
      },
      {
        greek:
          'οὐ βαπτίζονται οἱ ἁμαρτωλοὶ ὑπὸ τῶν ἀποστόλων, ἀλλ’ ἐξέρχονται ἐκ τούτων τῶν οἴκων πρὸς ἄλλους διδασκάλους.',
        english:
          'The sinners are not being baptized by the apostles, but are going out of these houses to other teachers.',
      },
      {
        greek: 'λέγετε ἐκείνοις τοῖς ἁμαρτωλοῖς ὅτι σώζεσθε ὑπὸ τοῦ θεοῦ ἀπὸ τῶν ἁμαρτιῶν ὑμῶν.',
        english: 'You say to those sinners that you are being saved by God from your sins.',
      },
      {
        greek: 'ἄρχει αὐτὸς ὁ θεὸς τῆς βασιλείας αὐτοῦ.',
        english: 'God himself rules his kingdom.',
      },
      {
        greek: 'εἰρήνην ἔχει ἡ ἐκκλησία, ὅτι σώζεται ὑπὸ τοῦ κυρίου αὐτῆς.',
        english: 'The church has peace, because it is being saved by its lord.',
      },
      {
        greek: 'οὐκ ἀποκρινόμεθα τῷ ἀποστόλῳ ὅτι οὐ γινώσκομεν αὐτόν.',
        english: 'We do not answer the apostle, because we do not know him.',
      },
      {
        greek: 'οὐχ ὑπὸ τῶν μαθητῶν σώζῃ ἀπὸ τῶν ἁμαρτιῶν σου, ἀλλ’ ὑπ’ αὐτοῦ τοῦ θεοῦ.',
        english: 'You are not being saved from your sins by the disciples, but by God himself.',
      },
      {
        greek:
          'οὐ πορεύῃ ἐν τῇ ὁδῷ τῇ κακῇ, ἀλλὰ σώζῃ ἀπὸ τῶν ἁμαρτιῶν σου καὶ οἱ ἀδελφοί σου ἀκούουσι τῆς φωνῆς τοῦ κυρίου.',
        english:
          'You are not going in the evil way, but you are being saved from your sins, and your brothers hear the voice of the lord.',
      },
      {
        greek: 'μετὰ τῶν ἀδελφῶν αὐτοῦ ἄγεται εἰς τὴν βασιλείαν τοῦ θεοῦ τῇ φωνῇ τῶν ἀποστόλων.',
        english:
          'With his brothers he is being led into the kingdom of God by the voice of the apostles.',
      },
      {
        greek: 'οὐ γίνῃ μαθητὴς τοῦ κυρίου, ὅτι οὐκ εἰσέρχῃ εἰς τὴν ἐκκλησίαν αὐτοῦ.',
        english: 'You are not becoming a disciple of the lord, because you do not enter into his church.',
      },
    ],
  },
]
