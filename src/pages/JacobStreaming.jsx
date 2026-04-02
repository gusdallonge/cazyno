import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, MapPin, Calendar, Users, TrendingUp, Gamepad2, Globe, Mic, Dumbbell, Heart, Sparkles, Play, Star, Zap, Eye, ArrowDown, Flame } from 'lucide-react';

const CATEGORIES = [
  {
    id: 'social',
    title: 'Social Experiments',
    icon: Mic,
    color: '#f59e0b',
    emoji: '🎤',
    description: 'Expériences sociales en live. Le genre de contenu que les gens partagent avant même que le stream soit fini.',
    ideas: [
      { num: 1, name: 'Lost in Translation', desc: '10 missions en parlant UNIQUEMENT français dans une ville anglophone. Commander à manger, prendre un Uber, draguer. Les viewers votent la prochaine mission. Le chaos = contenu.', viral: true },
      { num: 2, name: 'Hire Me For 1 Hour', desc: 'Il débarque dans un commerce et propose de bosser gratos pendant 1h. Serveur, vendeur, barber assistant. Chaque épisode = un job différent, des réactions imprévisibles.' },
      { num: 3, name: 'The Human Google', desc: 'Panneau "Ask me anything — I\'m French-Congolese" dans un lieu public. Les gens posent des questions. Conversations spontanées qui partent dans tous les sens.' },
      { num: 4, name: 'Trade Up', desc: 'Commence avec un objet à $1 et doit l\'échanger jusqu\'à atteindre $500+. "One red paperclip" mais en live avec le bagout de Jacob.', viral: true },
      { num: 5, name: 'Cultural Court', desc: '2 personnes de cultures différentes débattent d\'un sujet random : meilleure cuisine, meilleure musique, meilleure façon de draguer. Jacob est le juge.' },
      { num: 6, name: 'Reverse Tourist', desc: 'Il fait visiter la ville à des touristes en inventant TOUT. Fausses histoires, faux faits historiques. Combien de temps avant qu\'ils grillent le délire ?' },
      { num: 7, name: 'The Compliment Chain', desc: 'Un compliment sincère à un inconnu → il doit en faire un à quelqu\'un d\'autre → et ainsi de suite. Jacob suit la chaîne. Contenu feel-good viral.' },
      { num: 8, name: 'Blindfold City', desc: 'Les yeux bandés, guidé PAR LE CHAT. "Gauche", "droite", "entre dans ce magasin", "commande ça". Chaos garanti, clips assurés.' , viral: true },
      { num: 9, name: 'The Lie Detector', desc: '5 questions à des inconnus, une réponse est un mensonge. Jacob devine. S\'il perd = $20. S\'il gagne = gage du chat. Tension + humour.' },
      { num: 10, name: 'Profession Swap', desc: 'Pendant 3h, Jacob fait le job d\'un inconnu et l\'autre fait "streamer". Serveur, conducteur, coach. L\'autre personne doit gérer le chat en live.' },
      { num: 101, name: 'Fake Celebrity', desc: 'Jacob se déguise avec des lunettes noires et un bodyguard (un pote). Il marche dans la rue en mode star. Combien de gens vont demander des selfies sans savoir qui il est ? Le mouton de Panurge en live.', viral: true },
      { num: 102, name: 'Wrong Answers Only', desc: 'Jacob donne des indications dans la rue, mais TOUT est faux. Il envoie des gens dans la mauvaise direction, recommande le pire resto du quartier, invente des noms de rues. Caméra cachée style.', viral: true },
      { num: 103, name: 'Human Jukebox', desc: 'Jacob s\'installe avec une enceinte. Les gens choisissent une chanson, il doit la chanter EN ENTIER devant tout le monde. Même s\'il connaît pas. Le cringe quand il improvise les paroles.' },
      { num: 104, name: 'Confession Mic', desc: 'Un micro dans la rue. Panneau "Dis un truc que t\'as jamais dit à personne". Les gens passent et lâchent des bombes. Pas de filtre, pas de jugement. Le contenu s\'écrit tout seul.', viral: true },
      { num: 105, name: 'Accent Challenge', desc: 'Jacob parle aux gens avec un accent différent à chaque conversation. Russe, italien, jamaïcain, texan. Il doit tenir 5 min sans se griller. Le chat vote le prochain accent.' },
      { num: 106, name: 'Human ATM', desc: 'Jacob donne $1 à chaque personne qui lui raconte un truc intéressant. Si c\'est VRAIMENT intéressant, ça monte à $5, $10, $20. Il a $200 en budget. Le chat décide la note.', viral: true },
      { num: 107, name: 'Invisible Camera', desc: 'Jacob a un écouteur. Un pote caché lui dit EXACTEMENT quoi dire aux gens. Il doit répéter mot pour mot. Le pote dit des trucs de plus en plus absurdes. Jacob doit garder son sérieux.' },
      { num: 108, name: 'Face Swap IRL', desc: 'Jacob trouve un inconnu qui lui ressemble (de loin) et ils échangent leurs vêtements. Puis ils vont chacun parler aux potes de l\'autre pendant 30 min. Qui grille l\'échange en premier ?' },
    ]
  },
  {
    id: 'challenges',
    title: 'Challenges & Paris',
    icon: Dumbbell,
    color: '#ef4444',
    emoji: '💪',
    description: 'Défis avec un enjeu réel. Le genre de contenu où tu peux pas scroll past.',
    ideas: [
      { num: 11, name: 'The $100 Flip', desc: '$100 → $1000 en une journée, SANS casino. Vente à la sauvette, services, revente. Hustle pur. Le grind filmé en temps réel.', viral: true },
      { num: 12, name: 'Beat The Local', desc: 'Défier des gens dans LEUR discipline. Un basketteur au basket, un danseur en danse. 30 min de prep, mise de $200. L\'underdog energy.' },
      { num: 13, name: '24h With $0', desc: 'Survie sans un centime pendant 24h. Nourriture, logement, transport — tout gratos. Zero aide des viewers. Le vrai mode survie.', viral: true },
      { num: 14, name: 'Pain Roulette', desc: 'Roue avec des gages de plus en plus violents. Wasabi, ice bucket, wax strip. Les donations débloquent de nouveaux gages.' },
      { num: 15, name: 'Skill Speedrun', desc: 'Les viewers choisissent un skill. Jacob a 1 HEURE pour le maîtriser. Timer à l\'écran. Échec = gage. La pression crée le content.' },
      { num: 16, name: 'The Negotiator', desc: 'Flea markets et marchés : acheter ce qui vaut $100 pour $10. L\'accent français comme arme secrète de négociation.' },
      { num: 17, name: 'Stranger\'s Phone', desc: 'Emprunter le tel d\'un inconnu 2 min. Commander de la bouffe, envoyer un message wholesome, changer le wallpaper. Format TikTok-ready.', viral: true },
      { num: 18, name: 'Fitness Gauntlet', desc: '5 épreuves physiques, un challenger différent à chaque épreuve. Sprint, nage, pompes, burpees, corde. Les viewers parient sur le résultat.' },
      { num: 19, name: 'Cook Off: Street Edition', desc: 'Même ingrédients, cuisine face-à-face avec un random dans un parc. Des passants goûtent à l\'aveugle. Le perdant mange l\'intégralité du plat de l\'autre.' },
      { num: 20, name: 'Dare Market', desc: '$5 = dare facile. $20 = moyen. $50 = hardcore. Exécuté en temps réel, en public. UN seul veto par stream. Le chat est sans pitié.' },
      { num: 111, name: 'Human Piñata', desc: 'Jacob est suspendu dans un harnais (parc aventure). Chaque donation fait tourner la roue : lancer de balle, seau d\'eau, farine, slime, confettis. Le chat paye pour le torturer. Budget destruction illimité.' , viral: true },
      { num: 112, name: 'Eat It or Wear It', desc: 'Deux bols mystère. Jacob choisit : manger ou se le prendre sur la tête. Le chat décide ce qu\'il y a dans les bols. Ketchup, Nutella, mayo, purée de bébé, wasabi. Chaque round c\'est la roulette russe.', viral: true },
      { num: 113, name: 'Handcuffed 24h', desc: 'Menotté à un inconnu pendant 24h. Ils doivent TOUT faire ensemble : manger, marcher, dormir, aller aux toilettes. La relation évolue de "c\'est qui ce mec" à "mon frère".', viral: true },
      { num: 114, name: 'Reject Me Challenge', desc: 'Jacob doit se faire rejeter 30 fois dans la journée. Demander un avion en passant, négocier un McDo gratos, inviter un flic à dîner. Plus le rejet est absurde, plus c\'est drôle.' },
      { num: 115, name: 'Backwards Day', desc: 'Jacob fait TOUT à l\'envers pendant 24h. Commence par le dîner au réveil, marche en arrière dans la rue, met ses fringues à l\'envers. Les gens dans la rue sont complètement perdus.' },
      { num: 116, name: 'Yes Man 24h', desc: 'Jacob dit OUI à TOUT pendant 24h. Le chat et les gens dans la rue proposent. Tu veux aller en boîte ? Oui. Tu veux te raser la tête ? Oui. Tu veux manger 50 nuggets ? Oui. Aucun filtre.', viral: true },
      { num: 117, name: '$10K Treasure Hunt', desc: 'Jacob cache $10K en cash quelque part dans la ville et donne des indices en live. Les viewers IRL cherchent. Le premier qui trouve garde tout. La ville se transforme en jeu vidéo géant.', viral: true },
      { num: 118, name: 'Fear Factor Maison', desc: 'Jacob + 4 challengers. Épreuves dégueulasses : vers de farine, smoothie mystère, main dans un bac de trucs visqueux, sprint avec des œufs dans la bouche. Dernier debout gagne $500.' },
      { num: 119, name: 'Speed Dating Roulette', desc: 'Jacob organise un speed dating dans un parc. 10 personnes, 2 min chacun. Mais la roue décide le thème de chaque round : parler comme un robot, draguer avec des proverbes, parler que en questions.' },
      { num: 120, name: 'Salary Reveal', desc: 'Jacob demande aux gens dans la rue combien ils gagnent. Point blank. Ceux qui répondent, il devine leur métier. Ceux qui refusent, il essaie de deviner le salaire. La transparence choque toujours.', viral: true },
    ]
  },
  {
    id: 'guests',
    title: 'Guests & Interviews',
    icon: Users,
    color: '#8b5cf6',
    emoji: '🎬',
    description: 'Format posé mais jamais ennuyeux. Des conversations qu\'on peut pas avoir ailleurs.',
    ideas: [
      { num: 21, name: 'Le Salon de Jacob', desc: 'Podcast live. Deux fauteuils, bon son, bonne lumière. Questions qui vont en profondeur. Le format signature.' },
      { num: 22, name: 'Guess My Job', desc: 'Un invité entre. Le chat a 10 questions oui/non pour deviner son métier. Dominatrice pro, chasseur de primes, testeur de matelas. Puis l\'interview dévoile tout.', viral: true },
      { num: 23, name: 'French in the City', desc: 'Série récurrente. Un expat français différent par épisode. Comment ils ont atterri là, ce qu\'ils font, les galères et les wins.' },
      { num: 24, name: 'Life Swap Stories', desc: 'Deux guests aux vies opposées. Millionnaire vs. galère. Créateur adulte vs. prof. Ils échangent sans filtre. Jacob modère le clash des réalités.' },
      { num: 25, name: 'The Hot Seat', desc: '60 secondes par question. De plus en plus intime. Refus de répondre = gage du chat. Le format qui met tout le monde mal à l\'aise.' },
      { num: 26, name: 'Cooking With...', desc: 'Jacob cuisine un plat congolais avec son invité. Les conversations les plus naturelles se font devant une casserole. Puis ils goûtent et notent.' },
      { num: 27, name: 'The Duo Challenge', desc: 'Jacob + guest en escape room, karting, paintball. L\'activité révèle la vraie personnalité. Les alliances se forment et se brisent en live.' },
      { num: 28, name: 'Rate My Life', desc: 'Le guest montre son appart, sa caisse, son setup, ses fringues. Jacob et le chat notent de 1 à 10. Bienveillant mais honnête.' },
      { num: 29, name: '2 Truths 1 Lie', desc: '3 histoires. Une est inventée. Les histoires deviennent de plus en plus folles au fil de l\'épisode. Le chat se déchire dans les pronostics.' },
      { num: 30, name: 'The Mentor', desc: 'Un expert enseigne son domaine à Jacob en 1 heure. Trading, musique, séduction, business. Le décalage entre l\'élève et le prof = comédie.' },
      { num: 121, name: 'My Haters', desc: 'Jacob invite ses pires haters (commentaires, trolls du chat) en face-à-face. Ils doivent lui dire en face ce qu\'ils écrivent en ligne. 99% deviennent des agneaux. Les 1% restants = contenu en or.', viral: true },
      { num: 122, name: 'Millionaire or Broke ?', desc: 'Jacob invite 5 guests. Le chat doit deviner qui est riche et qui est fauché juste en regardant leur apparence, leur attitude, leurs réponses. Le reveal à la fin casse tous les préjugés.' , viral: true },
      { num: 123, name: 'Living Room Concert', desc: 'Un musicien random de la rue joue dans le salon/Airbnb de Jacob. Concert privé, 30 viewers en live sur un canapé. Intimité maximale, découverte d\'artistes inconnus.' },
      { num: 124, name: 'The Hypnotist', desc: 'Jacob fait venir un vrai hypnotiseur. Il se fait hypnotiser en live. Le chat décide les suggestions. Jacob qui fait la poule sur Kick = l\'event de l\'année.', viral: true },
      { num: 125, name: 'Speed Friends', desc: '10 inconnus, 5 min chacun. À la fin, Jacob doit choisir 1 personne pour passer le reste de la journée avec. Le élu devient le "co-streamer du jour". Lien humain instantané.' },
      { num: 126, name: 'Mon Père Réagit', desc: 'Le père ou un oncle de Jacob regarde ses anciens streams et réagit en direct. La réaction d\'un parent face au contenu de son fils sur internet. Le décalage est TOUJOURS drôle.' },
      { num: 127, name: 'Drunk History', desc: 'Un guest (un peu alcoolisé) doit raconter un événement historique de mémoire. Jacob vérifie les faits en temps réel. Plus c\'est faux, plus c\'est drôle. Le chat corrige en permanence.' },
      { num: 128, name: 'Ex On The Stream', desc: 'Jacob invite une ex (avec son accord complet). Ils reviennent sur leur relation en toute honnêteté. Le chat pose des questions. Le contenu le plus raw et authentique possible.', viral: true },
    ]
  },
  {
    id: 'casino',
    title: 'Casino & Gambling',
    icon: Gamepad2,
    color: '#00e701',
    emoji: '🎲',
    description: 'Le casino s\'intègre naturellement. Jamais forcé, toujours entertaining.',
    ideas: [
      { num: 31, name: 'Roulette Life', desc: 'La roulette décide la VIE de Jacob pour 24h. Rouge ou noir sur chaque décision. Les viewers proposent les options. Le lendemain = les conséquences en stream.', viral: true },
      { num: 32, name: 'Bankroll Challenge', desc: '$100 → objectif en une session. Bust = gage physique. Objectif atteint = giveaway. Le risque réel rend chaque spin intense.' },
      { num: 33, name: 'Casino Teacher', desc: 'Un guest qui n\'a JAMAIS joué apprend en live. Le débutant fait n\'importe quoi, Jacob coach du mieux qu\'il peut. Le chaos du newbie = les meilleurs clips.' },
      { num: 34, name: 'Chat Controls My Bets', desc: 'Le chat décide TOUT. Jeu, montant, timing. Jacob = une marionnette. La frustration de ne rien contrôler = le show.' , viral: true },
      { num: 35, name: 'Cashout or Continue', desc: 'Le chat vote à chaque palier. Continue et bust ? "C\'est VOTRE faute" — le running gag qui crée de l\'engagement massif.' },
      { num: 36, name: 'Casino Battle Royale', desc: '4-5 joueurs, $50 chacun, même jeu. Éliminatoire. Dernier debout gagne tout. Le format compétitif qui rend n\'importe quel jeu addictif à regarder.' },
      { num: 37, name: 'The Slot Scientist', desc: 'Jacob analyse les slots avec des graphiques Excel en temps réel. L\'absurdité d\'appliquer la méthode scientifique au hasard pur = comique.' },
      { num: 38, name: 'Forfeit Poker', desc: 'Chaque main perdue = gage. Plus le pot est gros, pire le gage. Au bout de 2h, le poker est oublié, c\'est un show de gages.' },
      { num: 39, name: 'Mystery Multiplier', desc: 'Timer secret. Quand ça sonne : all-in immédiat sur un jeu choisi par le chat. La surprise + l\'urgence = adrénaline pure.' },
      { num: 40, name: 'Jacob\'s Casino School', desc: 'Règles, stratégies, probabilités — tout expliqué. Le contenu éducatif qui build la crédibilité et la confiance sur le long terme.' },
      { num: 131, name: 'All-In Roulette', desc: 'Jacob met TOUT son cashout du mois sur un seul spin de roulette. Rouge ou noir. Le chat choisit la couleur. Un seul moment. Soit il double, soit il perd tout. Le stress est PALPABLE.', viral: true },
      { num: 132, name: 'Grandma Plays', desc: 'Jacob emmène une mamie (la sienne ou une random) jouer au casino en ligne. Elle découvre les slots, le blackjack. Ses réactions de mamie face aux gains/pertes = pureté totale.', viral: true },
      { num: 133, name: 'Drunk Casino', desc: 'Jacob boit un shot à chaque perte. Plus il perd, plus il est bourré, plus il fait des bets stupides, plus c\'est drôle. La spirale descendante en live. (Modéré évidemment).' },
      { num: 134, name: 'Casino Speedrun', desc: 'Timer de 10 min. $50 de départ. Jouer au maximum de jeux différents en 10 min. Chaque jeu = 1 min max. Le but c\'est pas de gagner, c\'est la frénésie, le chaos, les transitions.' },
      { num: 135, name: 'Bet On My Life', desc: 'Le chat mise sur des événements de la vie de Jacob. "Est-ce qu\'il va se faire recaler au club ce soir ?" "Est-ce que son plat va cramer ?" Paris en crédits casino sur des trucs IRL.', viral: true },
      { num: 136, name: 'Wheel of Misfortune', desc: 'Une roue avec 20 sections. 18 sont des gages horribles. 2 sont un jackpot. Jacob tourne après chaque session de jeu. Le suspense de la roue > le casino lui-même.' },
      { num: 137, name: 'Casino Blind Test', desc: 'Jacob met des jeux au hasard, ne regarde PAS l\'écran. Il joue uniquement au son. Le chat le guide. "BET BET BET". "NON CASHOUT". Il découvre le résultat en retournant l\'écran.' },
      { num: 138, name: 'Viewers Play, Jacob Pays', desc: 'Un viewer prend le contrôle du casino via screenshare. Jacob regarde, impuissant, pendant que quelqu\'un d\'autre flambe son argent. La frustration = le contenu.' },
    ]
  },
  {
    id: 'culture',
    title: 'Culture, Lifestyle & Real Talk',
    icon: Heart,
    color: '#ec4899',
    emoji: '🌍',
    description: 'Le contenu qui transforme des viewers en communauté.',
    ideas: [
      { num: 41, name: 'Congo Kitchen', desc: 'Jacob cuisine un plat congolais avec l\'histoire familiale derrière. Sa mère au téléphone pour valider la recette. Les viewers cuisinent en même temps.' },
      { num: 42, name: 'France vs. Miami vs. Kinshasa', desc: 'Débat culturel récurrent. Bouffe, dating, hustle, famille. Jacob compare ses 3 cultures. Le chat ramène les leurs.' },
      { num: 43, name: 'Wallet Watch', desc: 'Combien il a dépensé cette semaine, sur quoi. FULL transparence. Le contenu financier honnête que personne ne fait mais que tout le monde regarde.' , viral: true },
      { num: 44, name: 'Call My Mom', desc: 'Jacob appelle sa mère en live (avec son accord). Le filtre zéro d\'une mère française d\'origine congolaise face à la vie de son fils streamer. Le décalage générationnel en or.' },
      { num: 45, name: 'The Night Walk', desc: 'Tard le soir, Jacob marche seul. Pas de script. Il parle de sa vie, ses doutes, ses projets. Le format le plus intime, souvent le plus regardé.' },
      { num: 46, name: 'African Proverbs', desc: 'Chaque stream ouvre avec un proverbe africain expliqué. Le chat partage les siens. Ça devient la signature, le rituel communautaire.' },
      { num: 47, name: 'Expat Diaries', desc: 'Les vraies galères d\'expat. Visa, coût de la vie, solitude. Pas le Miami Instagram — le vrai. Le contenu authentique qui fidélise.' },
      { num: 48, name: 'Music Session', desc: 'Les viewers envoient leurs tracks. Jacob réagit honnêtement. Il fait découvrir la musique congolaise. Échange culturel en musique.' },
      { num: 49, name: 'Philosophy Hour', desc: '"L\'argent change les gens ?" "C\'est quoi le succès ?" Les grandes questions, débattues par une communauté mondiale. Ça sort du divertissement pur.' },
      { num: 50, name: 'The Gratitude Stream', desc: 'Une fois par mois. Bilan, fails, leçons, cadeaux aux viewers les plus actifs. Le rendez-vous communautaire.' },
      { num: 141, name: 'Learn My Language', desc: 'Jacob apprend 10 mots de la langue d\'un inconnu dans la rue en 10 min. Puis il doit commander dans un resto avec UNIQUEMENT ces mots. Le résultat est toujours absurde.', viral: true },
      { num: 142, name: 'Ancestry Live', desc: 'Jacob fait un test ADN en live et découvre les résultats avec le chat. Les pourcentages, les origines surprenantes, les discussions sur l\'identité. Un seul moment, ultra-personnel.' },
      { num: 143, name: 'Rich Kid Poor Kid', desc: 'Jacob passe 1 jour dans le quartier le plus riche de la ville et 1 jour dans le plus pauvre. Même questions aux gens. Le contraste parle de lui-même. Pas de morale forcée.', viral: true },
      { num: 144, name: 'Religion Roulette', desc: 'Chaque semaine, Jacob va dans un lieu de culte différent. Mosquée, église évangélique, temple bouddhiste, synagogue, temple hindou. Il participe, écoute, pose des questions. Zéro moquerie, 100% curiosité.' },
      { num: 145, name: 'Sleepover Chez Un Viewer', desc: 'Jacob dort chez un viewer (vérifié, safe). Il découvre sa vie, sa famille, son quotidien. Le viewer devient le guide de son propre monde. Le contenu le plus authentique qui existe.', viral: true },
      { num: 146, name: 'Letters To Strangers', desc: 'Jacob écrit une lettre manuscrite à un inconnu basée sur une conversation de 5 min avec lui. Il la lit à haute voix. Les gens pleurent parfois. Le contenu feel-good ultime.' },
      { num: 147, name: 'What\'s In Your Bag?', desc: 'Jacob arrête des gens et leur demande de vider leur sac/poches. Il essaie de deviner leur personnalité, leur job, leur vie juste avec le contenu de leur sac. Le Sherlock Holmes de rue.' },
      { num: 148, name: 'Buy Everything A Stranger Points At', desc: 'Dans un magasin avec un inconnu. Tout ce que la personne pointe du doigt, Jacob l\'achète. Pas de limite, pas de discussion. Le budget explose. Les gens abusent toujours.', viral: true },
    ]
  },
  {
    id: 'cities',
    title: 'City-Specific Bangers',
    icon: Globe,
    color: '#06b6d4',
    emoji: '📍',
    description: 'Du contenu qui n\'existe QUE dans cette ville. L\'avantage unfair du World Tour.',
    ideas: [
      { num: 51, name: 'Desert Survival', desc: 'Dubai — Largué dans le désert avec $50. Survivre 12h. Trouver de l\'eau, de la bouffe, un abri. Le mec de Paris dans le désert arabe = contenu.', city: 'Dubai', viral: true },
      { num: 52, name: 'Supercar Roulette', desc: 'Dubai — Repérer des Lamborghini, proposer un pari. Gagne = il conduit 10 min. Perd = il lave la voiture. Le culot made in France.', city: 'Dubai' },
      { num: 53, name: 'Tuk-Tuk Race', desc: 'Bangkok — 2 tuk-tuks, 2 équipes, course à travers la ville. 5 checkpoints avec défis (manger un insecte, marchander, trouver un temple).', city: 'Bangkok', viral: true },
      { num: 54, name: 'Capsule Hotel Challenge', desc: 'Tokyo — Vivre 48h dans un capsule hotel. Ne sortir que pour les défis du chat. Commander en japonais, karaoké solo, maid café, pachinko.', city: 'Tokyo' },
      { num: 55, name: 'Jollof Wars', desc: 'Lagos — Le débat le plus chaud d\'Afrique : quel pays fait le meilleur jollof rice ? Blind test avec Nigérians, Ghanéens, Sénégalais.', city: 'Lagos', viral: true },
      { num: 56, name: 'Sapeur for a Day', desc: 'Kinshasa — Relooké par les Sapeurs congolais. Full costume, cravate, chaussures vernies. Se promener dans la ville comme un prince. Les racines.', city: 'Kinshasa' },
      { num: 57, name: 'Lucha Libre', desc: 'Mexico City — Assister à un match, s\'entraîner avec les lutteurs, apprendre un move en 2h, faire un "match". Le masque, le costume, tout le show.', city: 'Mexico' },
      { num: 58, name: 'Gold Souk Haggle', desc: 'Dubai — $200 dans le Gold Souk. Repartir avec le maximum de valeur. L\'accent français face aux vendeurs = négociation épique.', city: 'Dubai' },
      { num: 59, name: 'Favela Barber', desc: 'São Paulo — Coupe de cheveux dans un vrai barbershop de quartier. Pas le barbier Instagram. Conversation authentique, le vrai Brésil.', city: 'São Paulo' },
      { num: 60, name: 'Muay Thai Debut', desc: 'Bangkok — 1 semaine d\'entraînement dans un camp, puis vrai combat amateur. La douleur, les 6h du mat, la peur. Arc narratif complet.', city: 'Bangkok', viral: true },
      { num: 151, name: 'Bollywood Extras', desc: 'Mumbai — Jacob essaie de se faire engager comme figurant dans un film Bollywood. Le casting, les chorégraphies qu\'il galère à apprendre, le tournage. Le Français perdu dans Bollywood.', city: 'Mumbai', viral: true },
      { num: 152, name: 'Taxi Karaoké', desc: 'Bangkok — Jacob prend des tuk-tuks et fait karaoké avec chaque chauffeur. Qui chante le mieux ? Le chauffeur gagne un pourboire proportionnel à sa performance. Le son est horrible, c\'est parfait.', city: 'Bangkok' },
      { num: 153, name: 'Lost on Purpose', desc: 'N\'importe quelle ville — Jacob se fait déposer à un endroit RANDOM (le chat choisit sur Google Maps) sans GPS, sans cash, sans langue. Il doit rentrer chez lui en se débrouillant.', viral: true },
      { num: 154, name: 'Sumo Training', desc: 'Tokyo — Jacob s\'inscrit à un entraînement de sumo. Le mec de 80kg face à des gars de 150kg. Il se fait détruire. Le contraste physique + le respect du sport japonais.', city: 'Tokyo', viral: true },
      { num: 155, name: 'Carnaval Chaos', desc: 'Rio — Jacob débarque en plein carnaval. Il doit apprendre la samba en 2h et défiler avec une école de samba. Le costume à plumes, les moves qu\'il invente, l\'énergie de la foule.', city: 'Rio' },
      { num: 156, name: 'Ice Hotel', desc: 'Suède — Dormir dans un hôtel entièrement fait de glace. -5°C toute la nuit. Le chat le réveille toutes les heures pour un défi dans le froid. Survivre = gagner. Le mec tropical dans la glace.', city: 'Suède' },
      { num: 157, name: 'Monkey Forest', desc: 'Bali — Jacob entre dans la forêt des singes avec de la nourriture. Les singes lui volent tout : lunettes, téléphone, casquette. La galère pour récupérer ses affaires en live.', city: 'Bali', viral: true },
      { num: 158, name: 'Hitchhike Race', desc: 'N\'importe où — Jacob vs un pote. Point A à point B, uniquement en auto-stop. Premier arrivé gagne $1000. Le stress de convaincre des inconnus de te prendre. La route = le contenu.' },
    ]
  },
  {
    id: 'girls',
    title: 'Guests Féminins & Créatrices',
    icon: Flame,
    color: '#f43f5e',
    emoji: '🔥',
    description: 'Du chill au spicy. Influenceuses, créatrices MYM, actrices adultes. Classé par niveau de heat.',
    ideas: [
      // ——— CHILL ———
      { num: 61, name: 'Girl vs. Boy', desc: 'Jacob invite une influenceuse et ils débattent des clichés homme/femme. Dating, red flags, DMs, qui paye au resto. Le chat prend parti. Conversations honnêtes, pas de drama forcé.', heat: 1 },
      { num: 62, name: 'Rate My DMs', desc: 'Une influenceuse montre ses DMs les plus gênants (floutés). Jacob et elle notent les tentatives de drague. Le chat meurt de rire. Les mecs dans le chat prennent des notes.', heat: 1, viral: true },
      { num: 63, name: 'Cooking Date', desc: 'Jacob cuisine un plat congolais avec une invitée. Ambiance date — bougies, musique, bonne bouffe. Mais le chat sabote en ajoutant des ingrédients random qu\'il doit incorporer.', heat: 1 },
      { num: 64, name: 'Girl\'s Perspective', desc: 'Série récurrente. Une femme d\'un milieu inattendu (pilote, ingénieure, lutteuse, chirurgienne) raconte son quotidien. Jacob pose les questions que les mecs osent pas poser.', heat: 1 },
      { num: 65, name: 'Streetstyle Jury', desc: 'Jacob et une influenceuse mode s\'installent dans la rue et notent les looks des passants. Elle donne les tips fashion, Jacob donne l\'avis du mec lambda. Le décalage = contenu.', heat: 1 },

      // ——— MEDIUM ———
      { num: 66, name: 'Lie Detector: Dating Edition', desc: 'Jacob et une invitée se posent des questions de plus en plus intimes sur un faux détecteur de mensonges. Body count, pires dates, plus gros ick, crush inavoué. Le malaise crée les clips.', heat: 2, viral: true },
      { num: 67, name: 'MYM Business Talk', desc: 'Interview format sérieux d\'une créatrice MYM qui cartonne. Combien elle gagne, sa stratégie, le regard de sa famille, les haters, la gestion business. Le côté entrepreneur que personne ne montre.', heat: 2 },
      { num: 68, name: 'Hot Takes Roulette', desc: 'Jacob et 2-3 créatrices tournent la roue. Chaque section = un sujet spicy (jalousie, couple libre, sugar daddy, friendzone, taille ça compte ?). Chacun donne son take honnête.', heat: 2, viral: true },
      { num: 69, name: 'Swipe Session', desc: 'Jacob laisse une invitée prendre le contrôle de son Tinder en live. Elle swipe, elle écrit les messages, elle organise un date. Jacob doit y aller le lendemain. Le chat regarde le désastre.', heat: 2, viral: true },
      { num: 70, name: 'Le Jeu de la Séduction', desc: 'Jacob affronte une influenceuse dans un jeu de drague. Chacun doit faire craquer un(e) inconnu(e) en premier dans un bar ou un café. Le perdant paye l\'addition de tout le monde.', heat: 2 },
      { num: 71, name: 'Couple Test', desc: 'Jacob et une invitée font semblant d\'être en couple pendant 2h en ville. Ils doivent convaincre les gens. Situations awkward garanties : rencontrer des "amis", choisir des meubles, régler une "dispute".', heat: 2 },

      // ——— SPICY ———
      { num: 72, name: 'Ask a Porn Star', desc: 'Format interview décontracté avec une actrice adulte. Les viewers envoient leurs questions. Elle répond sans filtre. Les coulisses de l\'industrie, les clichés vrais ou faux, le quotidien réel.', heat: 3 },
      { num: 73, name: 'OnlyFans vs. MYM vs. Real Job', desc: 'Table ronde : une créatrice OF, une créatrice MYM et quelqu\'un avec un "vrai" job. Même questions à chacune : revenus, regard de la société, vie amoureuse, projets. Pas de jugement, du vrai.', heat: 3 },
      { num: 74, name: 'Body Language Expert', desc: 'Un expert en body language analyse en temps réel les interactions de Jacob avec des invitées. Il décrypte la drague, les signaux, le malaise. Jacob découvre tout ce que son corps trahit.', heat: 3, viral: true },
      { num: 75, name: 'Kiss, Marry, Kill — IRL', desc: 'Jacob + 3-4 créatrices jouent à KMK avec des célébrités, des situations, des profils Tinder. Mais chaque "kill" = un gage physique (hot sauce, ice bucket). Ça dérape toujours.', heat: 3, viral: true },
      { num: 76, name: 'The Confession Booth', desc: 'Un rideau, un micro, une lumière. Des créatrices adultes et influenceuses passent une par une et racontent leur anecdote la plus folle, leur secret, leur moment le plus gênant. Jacob réagit derrière le rideau sans les voir.', heat: 3 },

      // ——— HOT ———
      { num: 77, name: 'Whisper Challenge: After Dark', desc: 'Jacob et une actrice adulte avec des casques anti-bruit. Les phrases à deviner sont de plus en plus suggestives. Le lip reading crée des malentendus hilarants. Le chat explose.', heat: 4, viral: true },
      { num: 78, name: '7 Seconds Challenge', desc: 'Jacob face à une créatrice. 7 secondes pour : le meilleur compliment, la pire phrase de drague, imiter un son, un regard séducteur, une pose. Celui qui craque en premier perd. Le malaise monte à chaque round.', heat: 4 },
      { num: 79, name: 'Finish The Sentence', desc: 'Phrases à compléter de plus en plus osées avec des créatrices adultes. "La chose la plus folle que j\'ai faite pour de l\'argent c\'est..." / "Mon plus gros regret au lit c\'est...". Le chat vote la meilleure réponse.', heat: 4, viral: true },
      { num: 80, name: 'Strip Quiz', desc: 'Quiz culture générale avec une créatrice. Chaque mauvaise réponse = retirer un accessoire (chapeau, chaussure, bijou, veste — rien de NSFW). La tension monte, le chat aide en trichant, le drama quand quelqu\'un se plante.', heat: 4 },
      { num: 81, name: 'The Ex Files', desc: 'Une actrice adulte et Jacob racontent leur pire histoire d\'ex à tour de rôle. Le chat vote qui a l\'ex le plus toxic. La sincérité de la conversation surprend toujours les viewers.', heat: 4 },
      { num: 82, name: 'Blind Date Setup', desc: 'Jacob organise un blind date EN LIVE entre un viewer (en visio) et une créatrice MYM/actrice. Il coach le viewer dans l\'oreillette. Le chat donne des conseils. Le cringe + l\'émotion quand ça match.', heat: 4, viral: true },

      // ——— ENCORE PLUS ———
      { num: 161, name: 'Who\'s The Couple?', desc: '4 duos mixtes sur le stream. Certains sont des vrais couples, d\'autres des inconnus qui se sont rencontrés 5 min avant. Le chat doit deviner. Les faux couples doivent jouer le jeu. Plus c\'est crédible, plus c\'est drôle.', heat: 2, viral: true },
      { num: 162, name: 'Makeover Challenge', desc: 'Une influenceuse beauty relooke Jacob de A à Z. Maquillage, coiffure, tenue. Il doit porter le look pendant tout le reste du stream, en public. La réaction des gens dans la rue = or.', heat: 1, viral: true },
      { num: 163, name: 'Red Flag / Green Flag', desc: 'Jacob + 3 créatrices. Chacun montre son profil dating et les autres lèvent des drapeaux rouges ou verts en commentant à voix haute. Le roast est impitoyable mais drôle.', heat: 2 },
      { num: 164, name: 'Pillow Talk', desc: 'Format late night. Jacob et une invitée sont allongés sur un lit (habillés) dans le noir avec juste des petites lumières. Questions profondes, confessions, silences. L\'intimité de la discussion en mode ASMR.', heat: 3 },
      { num: 165, name: 'OnlyFans Manager For A Day', desc: 'Jacob gère le compte d\'une créatrice pendant 24h (messages, posts, stratégie). Il découvre ce que c\'est VRAIMENT de faire ce métier. Les DMs qu\'il doit répondre = choc culturel total.', heat: 3, viral: true },
      { num: 166, name: 'The Bouncer Test', desc: 'Jacob et 5 filles essaient de rentrer dans des clubs. Elles passent toutes facilement. Lui se fait recaler. Il essaie toutes les stratégies : VIP, négociation, déguisement. Le struggle du mec normal.', heat: 1 },
      { num: 167, name: 'Bikini vs. Costard', desc: 'Jacob en costard 3 pièces à la plage. Une créatrice en bikini dans un bureau. Ils vivent la journée de l\'autre. La réaction des gens dans les deux situations = la différence homme/femme résumée.', heat: 3, viral: true },
      { num: 168, name: 'Twerk Academy', desc: 'Une danseuse pro essaie d\'apprendre à twerker à Jacob en 1h. Il est CATASTROPHIQUE. La progression (ou pas) est filmée. À la fin, performance publique. Le chat vote si c\'est validé.', heat: 2, viral: true },
      { num: 169, name: 'My Mom Rates Them', desc: 'La mère de Jacob (en appel) note les profils Instagram de créatrices/influenceuses. Les commentaires d\'une mère sur le contenu de ces filles = le décalage générationnel maximal. Gênant et hilarant.', heat: 2, viral: true },
      { num: 170, name: 'Sleep With Me (Literally)', desc: 'ASMR stream. Jacob et une invitée essaient de dormir en live. Le chat fait TOUT pour les réveiller : alertes sonores, dons bruyants, missions. Premier qui craque a perdu. Le concept le plus con = les meilleurs clips.', heat: 3 },
    ]
  },
  {
    id: 'irl',
    title: 'IRL & Lifestyle',
    icon: Eye,
    color: '#22d3ee',
    emoji: '🎥',
    description: 'Sortir, marcher, vivre. Pas de concept, pas de script — juste Jacob dans la vraie vie.',
    ideas: [
      { num: 83, name: 'Just Walking', desc: 'Jacob se balade dans un quartier qu\'il connaît pas. Caméra, tchatche, il parle aux gens, rentre dans les commerces, goûte les trucs, commente tout. Le stream le plus simple et souvent le plus long en watch time.', viral: true },
      { num: 84, name: 'Random Activity Generator', desc: 'Le chat lance un dé. 1=karting 2=bowling 3=escape room 4=trampoline park 5=laser game 6=paintball. Jacob y va direct avec des inconnus qu\'il recrute dans la rue.', viral: true },
      { num: 85, name: 'Day in My Life', desc: 'Jacob filme sa vraie journée de A à Z. Le réveil, le petit-déj, la salle de sport, les calls, le stream prep. Pas de montage, pas de fake. Les viewers vivent sa vie pendant 24h.' },
      { num: 86, name: 'Uber Adventures', desc: 'Jacob prend des Uber et essaie de devenir pote avec chaque chauffeur. Il leur offre un café, découvre leur histoire. Les meilleures conversations arrivent dans une voiture.' },
      { num: 87, name: 'Street Food Crawl', desc: 'Jacob goûte TOUT ce qu\'il trouve dans la rue. Stand par stand, note de 1 à 10 en live. Le chat parie sur ses réactions. Le dernier stand = celui que le chat choisit.' },
      { num: 88, name: 'Mall Challenge', desc: 'Dans un centre commercial. Le chat lui donne des missions : essayer les habits les plus moches, se faire maquiller, demander des échantillons partout, négocier dans un Apple Store.' },
      { num: 89, name: 'Gym Bro IRL', desc: 'Jacob va dans une salle de sport random et demande aux gens de lui apprendre leur exercice préféré. Il teste tout : crossfit, yoga, pole dance, boxe. Le décalage entre les salles = contenu.', viral: true },
      { num: 90, name: 'Find The Best...', desc: 'Chaque épisode = une quête. Le meilleur burger de la ville, le meilleur barbier, le meilleur café pour bosser, le meilleur spot photo. Jacob compare 5 endroits et fait un classement final.' },
      { num: 91, name: 'Night Market', desc: 'Exploration de nuit. Marchés, quartiers vivants, food trucks, bars cachés. Jacob parle aux noctambules, aux vendeurs, aux fêtards. L\'énergie de la nuit donne un stream complètement différent.' },
      { num: 92, name: 'Vibes & Drive', desc: 'Jacob loue une voiture, met la playlist du chat et drive dans la ville. Il s\'arrête quand un truc l\'intrigue. Coucher de soleil, quartier stylé, resto random. Le chill ultime.', },
      { num: 93, name: 'Tourist Mode', desc: 'Jacob fait TOUT ce que font les touristes dans sa propre ville. Bus touristique, selfie devant les landmarks, acheter des souvenirs moches, poser des questions évidentes. Le local qui joue au touriste.', viral: true },
      { num: 94, name: 'Beach Day', desc: 'Journée plage. Volley avec des inconnus, défis dans l\'eau, course de nage, tentative de surf. Pas de concept — juste une caméra à la plage et du charisme. Le contenu d\'été qui cartonne.', },
      { num: 95, name: 'Co-Working Strangers', desc: 'Jacob s\'installe dans un café avec son laptop et engage la conversation avec les gens autour. Digital nomads, freelances, étudiants. Il découvre ce que font les gens et partage sa propre histoire.' },
      { num: 171, name: 'Wrong Bus', desc: 'Jacob prend un bus random sans regarder la destination. Où ça le mène, c\'est là qu\'il stream. Le terminus d\'un bus de banlieue à 2h du centre = aventure garantie.', viral: true },
      { num: 172, name: 'Living In A Car', desc: 'Jacob vit dans une voiture pendant 48h. Pas d\'hôtel, pas d\'Airbnb. Il doit tout faire dedans : dormir, manger, streamer. La galère + la créativité pour survivre.', viral: true },
      { num: 173, name: 'Craigslist Adventure', desc: 'Jacob répond aux annonces les plus bizarres de Craigslist/Le Bon Coin. Offre d\'emploi random, meubles gratuits à récupérer, demande d\'aide farfelue. Chaque annonce = un mini-episode.' },
      { num: 174, name: 'Invisible Man', desc: 'Jacob essaie de traverser une ville entière sans que personne ne le remarque ou lui parle. S\'il se fait interpeller = il recommence. Mission impossible quand tu fais 1m80 avec une caméra.' },
      { num: 175, name: 'Rooftop Hopping', desc: 'Jacob essaie de trouver les plus beaux rooftops de la ville. Négocier l\'accès, découvrir des vues incroyables, rencontrer les gens qui vivent en hauteur. Le tout filmé au coucher du soleil.' },
      { num: 176, name: 'Deliver With Me', desc: 'Jacob devient livreur UberEats pendant un shift entier. Le chat voit les commandes, les galères de livraison, les pourboires, les clients bizarres. Les coulisses d\'un métier que tout le monde utilise.' },
      { num: 177, name: 'Thrift Flip', desc: 'Jacob a $20 en friperie. Il doit assembler la meilleure tenue possible et la porter pendant 24h. Le chat vote s\'il a réussi ou si c\'est un désastre fashion.', viral: true },
      { num: 178, name: 'Sunrise to Sunset', desc: 'Stream de 12h non-stop. Du lever au coucher du soleil. Pas de plan, pas de script. Juste une journée entière en live. Le contenu le plus brut et imprévisible.' },
      { num: 179, name: 'Abandoned Places', desc: 'Jacob explore des lieux abandonnés (légalement). Usines, hôtels, parcs d\'attraction. La vibe creepy, les trouvailles, les histoires. Stream nocturne = ambiance horreur.' },
      { num: 180, name: 'Festival Infiltrator', desc: 'Jacob se pointe à un festival sans billet et essaie d\'entrer par tous les moyens. Négociation, charme, bluff. S\'il entre, il stream le festival entier. Le con artist energy.', viral: true },
    ]
  },
];

const CITIES = [
  { name: 'Miami', flag: '🌴', vibe: 'Hustle, nightlife, plage', color: '#f59e0b', role: 'QG' },
  { name: 'Dubai', flag: '🏙️', vibe: 'Luxe, extrême, desert', color: '#ef4444' },
  { name: 'Bangkok', flag: '🛺', vibe: 'Chaos, street food, culture', color: '#06b6d4' },
  { name: 'Tokyo', flag: '🗼', vibe: 'Weird, tech, discipline', color: '#ec4899' },
  { name: 'Bali', flag: '🌊', vibe: 'Spirituel, nature, nomads', color: '#10b981' },
  { name: 'Mexico City', flag: '🌮', vibe: 'Raw, cuisine, art', color: '#f97316' },
  { name: 'Medellín', flag: '🌺', vibe: 'Renaissance, nightlife', color: '#8b5cf6' },
  { name: 'Lagos', flag: '🎵', vibe: 'Energie, afrobeats, business', color: '#eab308' },
  { name: 'Kinshasa', flag: '🫀', vibe: 'Les racines de Jacob', color: '#00e701' },
  { name: 'São Paulo', flag: '⚽', vibe: 'Immense, contrastes, fête', color: '#3b82f6' },
];

const TIMELINE = [
  { period: 'Mois 1-2', city: 'Miami', content: 'Social experiments, challenges, premiers guests', casino: 'Zéro casino. Jacob build son perso.', casinoLevel: 0 },
  { period: 'Mois 3', city: 'Dubai', content: 'Contenu luxe/extrême + premiers paris IRL', casino: 'Jacob "découvre" les jeux en off', casinoLevel: 1 },
  { period: 'Mois 4', city: 'Bangkok', content: 'Culture, Muay Thai, street food', casino: 'Casino Night 1x/semaine', casinoLevel: 2 },
  { period: 'Mois 5-6', city: 'Miami', content: 'Guests gros noms, collabs majeures', casino: 'Casino Night 2-3x/semaine', casinoLevel: 3 },
  { period: 'Mois 7', city: 'Tokyo', content: 'Contenu weird/tech/arcade', casino: 'Casino intégré naturellement', casinoLevel: 4 },
  { period: 'Mois 8-9', city: 'Kinshasa', content: 'Retour aux racines (arc émotionnel)', casino: 'Mascotte officielle du casino', casinoLevel: 5 },
  { period: 'Mois 10+', city: 'Rotation libre', content: 'Le chat vote la prochaine ville', casino: 'Pilier permanent', casinoLevel: 5 },
];

const SCHEDULE = [
  { day: 'LUN', afternoon: 'Street content', evening: 'Casino Night', eveningColor: '#00e701' },
  { day: 'MAR', afternoon: 'Challenge IRL', evening: 'OFF', eveningColor: '#4b5c6f' },
  { day: 'MER', afternoon: 'Guest / Collab', evening: 'Casino + Guest', eveningColor: '#8b5cf6' },
  { day: 'JEU', afternoon: 'Culture / Real Talk', evening: 'Exploration ville', eveningColor: '#06b6d4' },
  { day: 'VEN', afternoon: 'Challenge IRL', evening: 'Casino Night ★', eveningColor: '#00e701' },
  { day: 'SAM', afternoon: 'Guest / Influenceur', evening: 'Nightlife review', eveningColor: '#ec4899' },
  { day: 'DIM', afternoon: 'OFF', evening: 'Chill ou OFF', eveningColor: '#4b5c6f' },
];

function IdeaCard({ idea, color }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="group relative rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:translate-y-[-2px]"
      style={{
        background: expanded
          ? `linear-gradient(145deg, ${color}12, ${color}06)`
          : `linear-gradient(145deg, #111a2560, #111a2530)`,
        border: `1px solid ${expanded ? color + '30' : '#1a2a3860'}`,
        boxShadow: expanded ? `0 8px 32px ${color}08` : 'none',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black font-orbitron"
            style={{ background: `${color}15`, color, border: `1px solid ${color}20` }}
          >
            {idea.num}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-white text-sm">{idea.name}</h4>
              {idea.viral && (
                <span className="shrink-0 text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-md font-bold"
                  style={{ background: '#ef444420', color: '#ef4444' }}>
                  viral
                </span>
              )}
              {idea.heat != null && (
                <span className="shrink-0 flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-md font-bold"
                  style={{ background: '#f43f5e15' }}>
                  {[...Array(4)].map((_, i) => (
                    <span key={i} style={{ color: i < idea.heat ? '#f43f5e' : '#f43f5e30', fontSize: '8px' }}>🔥</span>
                  ))}
                </span>
              )}
            </div>
            {idea.city && (
              <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color: `${color}99` }}>
                {idea.city}
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 shrink-0 mt-2 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          style={{ color: `${color}60` }}
        />
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-48 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-[#b0bec5] text-sm leading-relaxed">{idea.desc}</p>
      </div>
    </div>
  );
}

function CategorySection({ category, index }) {
  const Icon = category.icon;
  const [showAll, setShowAll] = useState(false);
  const visibleIdeas = showAll ? category.ideas : category.ideas.slice(0, 4);

  return (
    <section className="mb-24">
      {/* Category header */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: `${category.color}10`, border: `1px solid ${category.color}15` }}
        >
          {category.emoji}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-black text-white font-orbitron tracking-tight">{category.title}</h3>
            <span className="text-xs px-2 py-1 rounded-lg font-bold font-orbitron"
              style={{ background: `${category.color}12`, color: category.color }}>
              {category.ideas.length}
            </span>
          </div>
          <p className="text-sm text-[#8B949E] mt-1">{category.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {visibleIdeas.map((idea) => (
          <IdeaCard key={idea.num} idea={idea} color={category.color} />
        ))}
      </div>

      {category.ideas.length > 4 && (
        <div className="flex justify-center mt-5">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-105"
            style={{ color: category.color, background: `${category.color}10`, border: `1px solid ${category.color}15` }}
          >
            {showAll ? 'Réduire' : `+${category.ideas.length - 4} idées`}
            <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}
    </section>
  );
}

export default function JacobStreaming() {
  const [activeTimelineIdx, setActiveTimelineIdx] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#060a10] text-white overflow-x-hidden">

      {/* ═══ HERO ═══ */}
      <header className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 20%, rgba(0,231,1,0.07) 0%, transparent 60%)',
          }} />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(circle at 80% 70%, rgba(139,92,246,0.05) 0%, transparent 40%)',
          }} />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(circle at 20% 80%, rgba(6,182,212,0.04) 0%, transparent 40%)',
          }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div className="relative text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
            style={{ background: '#00e70108', color: '#00e701', border: '1px solid #00e70118' }}>
            <Zap className="w-3.5 h-3.5" />
            Plan Streaming Complet
          </div>

          <h1 className="mb-6">
            <span className="block text-6xl sm:text-8xl font-black font-orbitron tracking-tighter text-white leading-none">
              JACOB
            </span>
            <span className="block text-3xl sm:text-5xl font-black font-orbitron tracking-tight mt-3 leading-tight"
              style={{ color: '#00e701' }}>
              STREAM IDEAS
            </span>
          </h1>

          <p className="text-[#8B949E] max-w-xl mx-auto text-lg leading-relaxed mb-3">
            Français d'origine congolaise. Drôle, zéro timidité, accent assumé.<br />
            Le <span className="text-white font-semibold">"French-Congolese guy exploring the world"</span> —<br />
            personne d'autre ne fait ça.
          </p>
          <p className="text-[#4b5c6f] text-sm mb-12">
            Pas un streamer gaming. Pas un streamer gambling. Un entertaineur nomade qui embarque sa communauté.
          </p>

          {/* Stats bar */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            {[
              { value: '150+', label: 'Idées', color: '#00e701' },
              { value: '10', label: 'Villes', color: '#06b6d4' },
              { value: '8', label: 'Catégories', color: '#8b5cf6' },
              { value: '6j', label: '/semaine', color: '#f59e0b' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-black font-orbitron" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] text-[#4b5c6f] uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="animate-bounce">
            <ArrowDown className="w-5 h-5 text-[#4b5c6f] mx-auto" />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4">

        {/* ═══ TOP 10 VIRAL ═══ */}
        <section className="py-24">
          <div className="text-center mb-12">
            <span className="text-4xl mb-4 block">💣</span>
            <h2 className="text-3xl font-black font-orbitron text-white tracking-tight mb-3">10 Concepts Viraux</h2>
            <p className="text-[#8B949E] text-sm max-w-lg mx-auto">
              Les 10 idées qui peuvent exploser dès le jour 1. Chacune est un clip TikTok en puissance. Pas du contenu — des MOMENTS.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { num: 1, name: '1 Langue, 1 Pays, 0 Chance', desc: 'Jacob atterrit dans un pays dont il parle PAS la langue. Pas de traducteur, pas de Google Translate, pas d\'anglais. Juste du français et du body language pour survivre 24h. Commander à manger, trouver un hôtel, se déplacer. Le galère filmée minute par minute. Chaque interaction est un sketch involontaire.', why: 'Le format "fish out of water" marche TOUJOURS. La barrière de langue crée du slapstick naturel. Chaque interaction = un clip.' },
              { num: 2, name: 'Drop Me Anywhere', desc: 'Les viewers choisissent un point GPS random sur la carte. Jacob est déposé là — peut être un champ, un village de 200 habitants, un quartier industriel. Il a 12h et $50 pour rentrer chez lui. Pas de réservation, pas de plan. Le chat le regarde galèrer en temps réel.', why: 'L\'imprévisibilité totale. Chaque épisode est différent. Le suspense de "est-ce qu\'il va s\'en sortir" garde les gens collés.' },
              { num: 3, name: 'Give $1000 To A Stranger (With A Twist)', desc: 'Jacob donne $1000 cash à un inconnu dans la rue. MAIS : il le suit (avec accord) pendant les 4 prochaines heures pour voir comment il dépense. Le contraste entre ce que les gens DISENT qu\'ils feraient et ce qu\'ils FONT réellement. Certains sont généreux, d\'autres partent au casino, d\'autres pleurent.', why: 'Le reveal de la vraie nature humaine. Émotionnel + imprévisible. Chaque épisode est unique. MrBeast-style mais avec du vrai storytelling.' },
              { num: 4, name: 'Living On $1 A Day', desc: 'Jacob vit pendant 7 jours avec $1/jour. Chaque jour est un épisode. Il doit manger, se laver, se déplacer avec $1. Jour 1 c\'est drôle. Jour 4 c\'est dur. Jour 7 c\'est émouvant. L\'arc narratif se crée naturellement.', why: 'Le format série crée de la fidélisation. Les gens reviennent chaque jour. La progression émotionnelle est naturelle.' },
              { num: 5, name: 'Steal His Look', desc: 'Jacob trouve un mec stylé dans la rue. Il a 1 HEURE et $100 pour copier son look complet en friperie. Puis il se met à côté du gars et les passants votent qui porte mieux. Le décalage entre l\'original et la copie discount = clips en or.', why: 'Visuel, rapide, drôle. Le split-screen avant/après est FAIT pour TikTok. Le format se décline à l\'infini dans chaque ville.' },
              { num: 6, name: 'Say Yes To The First Person', desc: 'Jacob sort de chez lui et la PREMIÈRE personne qui lui adresse la parole décide de sa journée. Si c\'est un SDF qui dit "viens manger", il mange avec lui. Si c\'est un mec d\'affaires qui dit "suis-moi", il suit. Zéro contrôle. La journée se construit au hasard des rencontres.', why: 'L\'imprévisibilité absolue. Impossible de planifier. Chaque épisode est un film dont personne ne connaît le scénario.' },
              { num: 7, name: 'Train Roulette', desc: 'Jacob va à la gare, ferme les yeux, pointe un train au hasard et monte dedans. Terminus = c\'est là qu\'il doit passer la nuit. Pas de recherche, pas de réservation. Ça peut être Marrakech, ça peut être un bled de 500 habitants. Le suspense du destination reveal.', why: 'Le moment où il découvre la destination = LE clip. La suite est du bonus. Format ultra-viral sur Shorts/Reels.' },
              { num: 8, name: 'Trade Your Way Home', desc: 'Jacob est à 100km de chez lui sans argent ni transport. Il doit rentrer en échangeant des services. "Je porte tes courses si tu m\'emmènes 10km". "Je fais la vaisselle si je dors sur ton canapé". Chaque échange est une micro-histoire humaine.', why: 'La quête crée du suspense. Chaque échange est un nouveau personnage. Le spectateur se demande s\'il va réussir. Format binge-worthy.' },
              { num: 9, name: 'Survive On Donations', desc: 'Jacob commence un stream avec RIEN. Chaque donation de viewer débloque quelque chose. $5 = un verre d\'eau. $10 = un repas. $50 = un Uber. $100 = un hôtel. Le chat contrôle littéralement sa survie. S\'ils donnent pas = il dort dehors. La gamification de la générosité.', why: 'Le chat se sent responsable. L\'engagement est MAXIMAL. Les gens donnent pas pour Jacob, ils donnent pour le POUVOIR. Ça rend le stream interactif à un niveau jamais vu.' },
              { num: 10, name: 'Knock On 100 Doors', desc: 'Jacob toque à 100 portes d\'un quartier résidentiel. Il demande juste "racontez-moi un truc intéressant sur votre vie". Certains ferment la porte. D\'autres l\'invitent à dîner. D\'autres racontent des histoires de dingue. Le format est simple. Le contenu est infini.', why: 'La simplicité du concept. Pas de production, pas de setup. Juste un mec et une porte. Les histoires des gens ordinaires sont souvent les plus extraordinaires.' },
            ].map((idea) => (
              <div key={idea.num} className="rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-2px]"
                style={{ background: 'linear-gradient(145deg, #f43f5e08, #f59e0b05)', border: '1px solid #f43f5e15' }}>
                <div className="flex items-start gap-4">
                  <span className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black font-orbitron"
                    style={{ background: '#f43f5e15', color: '#f43f5e', border: '1px solid #f43f5e20' }}>
                    {idea.num}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-base mb-2">{idea.name}</h4>
                    <p className="text-[#b0bec5] text-sm leading-relaxed mb-3">{idea.desc}</p>
                    <div className="flex items-start gap-2 text-xs rounded-xl p-3" style={{ background: '#00e70108', border: '1px solid #00e70110' }}>
                      <span className="text-[#00e701] font-bold shrink-0 mt-px">WHY IT WORKS:</span>
                      <span className="text-[#8B949E]">{idea.why}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ WORLD TOUR ═══ */}
        <section className="py-24">
          <div className="text-center mb-12">
            <span className="text-4xl mb-4 block">🌍</span>
            <h2 className="text-3xl font-black font-orbitron text-white tracking-tight mb-3">Les Villes</h2>
            <p className="text-[#8B949E] text-sm max-w-lg mx-auto">
              Jacob change de ville toutes les 2-4 semaines. Chaque ville = un arc narratif. Le chat vote la prochaine destination.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {CITIES.map((city) => (
              <div
                key={city.name}
                className="group rounded-2xl p-5 text-center transition-all duration-500 hover:translate-y-[-4px] cursor-default"
                style={{
                  background: `linear-gradient(160deg, ${city.color}08, transparent)`,
                  border: `1px solid ${city.color}15`,
                }}
              >
                <div className="text-3xl mb-3 transition-transform duration-300 group-hover:scale-125">{city.flag}</div>
                <div className="font-black text-white text-sm font-orbitron">{city.name}</div>
                <div className="text-[11px] text-[#6b7280] mt-1.5 leading-snug">{city.vibe}</div>
                {city.role && (
                  <span className="inline-block mt-3 text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full"
                    style={{ background: `${city.color}15`, color: city.color }}>
                    {city.role}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl p-5 text-center" style={{ background: '#0d131b', border: '1px solid #1a2a3840' }}>
            <p className="text-sm text-[#8B949E]">
              <span className="font-bold text-white">Chaque arc :</span> Épisode d'arrivée → 2-3 semaines de contenu local → Épisode final + vote prochaine destination
            </p>
          </div>
        </section>

        {/* ═══ PLANNING ═══ */}
        <section className="pb-24">
          <div className="text-center mb-12">
            <span className="text-4xl mb-4 block">📅</span>
            <h2 className="text-3xl font-black font-orbitron text-white tracking-tight mb-3">Semaine Type</h2>
            <p className="text-[#8B949E] text-sm">~4-5h/jour — S'adapte selon la ville</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {SCHEDULE.map((s) => (
              <div key={s.day} className="rounded-2xl p-4 text-center" style={{ background: '#0d131b', border: '1px solid #1a2a3830' }}>
                <div className="font-black text-white font-orbitron text-xs mb-4 tracking-wider">{s.day}</div>
                <div className="space-y-3">
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-[#4b5c6f] mb-1">15h</div>
                    <div className="text-[11px] text-[#94a3b8] leading-snug">{s.afternoon}</div>
                  </div>
                  <div className="h-px w-8 mx-auto" style={{ background: '#1a2a38' }} />
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-[#4b5c6f] mb-1">21h</div>
                    <div className="text-[11px] font-semibold leading-snug" style={{ color: s.eveningColor }}>{s.evening}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ TIMELINE ═══ */}
        <section className="pb-24">
          <div className="text-center mb-12">
            <span className="text-4xl mb-4 block">📈</span>
            <h2 className="text-3xl font-black font-orbitron text-white tracking-tight mb-3">Timeline Casino</h2>
            <p className="text-[#8B949E] text-sm">D'abord les gens aiment Jacob. Ensuite ils jouent.</p>
          </div>

          <div className="space-y-2">
            {TIMELINE.map((t, i) => (
              <div
                key={i}
                className="group rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer transition-all duration-300 hover:translate-x-1"
                style={{
                  background: activeTimelineIdx === i ? '#111a2580' : '#0d131b',
                  border: `1px solid ${activeTimelineIdx === i ? '#00e70125' : '#1a2a3825'}`,
                }}
                onClick={() => setActiveTimelineIdx(activeTimelineIdx === i ? null : i)}
              >
                <div className="shrink-0">
                  <span className="text-xs font-black font-orbitron px-3 py-1.5 rounded-lg"
                    style={{ background: '#00e70110', color: '#00e701' }}>
                    {t.period}
                  </span>
                </div>
                <div className="shrink-0 w-28">
                  <span className="text-sm font-bold text-white">{t.city}</span>
                </div>
                <div className="flex-1 text-sm text-[#8B949E]">{t.content}</div>
                <div className="shrink-0 flex items-center gap-3">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, si) => (
                      <div
                        key={si}
                        className="w-2.5 h-2.5 rounded-full transition-colors"
                        style={{
                          background: si < t.casinoLevel ? '#00e701' : '#1a2a38',
                          boxShadow: si < t.casinoLevel ? '0 0 6px #00e70140' : 'none',
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#6b7280] w-44 text-right hidden md:block">{t.casino}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ LES 60 IDÉES ═══ */}
        <section className="pb-12">
          <div className="text-center mb-16">
            <span className="text-4xl mb-4 block">⚡</span>
            <h2 className="text-3xl font-black font-orbitron text-white tracking-tight mb-3">Les 60 Idées</h2>
            <p className="text-[#8B949E] text-sm">Clique pour ouvrir le détail</p>
          </div>
        </section>

        {CATEGORIES.map((cat, i) => (
          <CategorySection key={cat.id} category={cat} index={i} />
        ))}

        {/* ═══ 5 RULES ═══ */}
        <section className="pb-24">
          <div className="text-center mb-12">
            <span className="text-4xl mb-4 block">🏆</span>
            <h2 className="text-3xl font-black font-orbitron text-white tracking-tight">Les 5 Règles</h2>
          </div>

          <div className="space-y-3">
            {[
              { num: 1, title: 'Sois toi-même', desc: 'L\'accent, l\'humour, la double culture. Ne lisse jamais.', color: '#00e701' },
              { num: 2, title: 'Le casino vient APRÈS', desc: 'D\'abord les gens t\'aiment, ensuite ils jouent.', color: '#f59e0b' },
              { num: 3, title: '1 clip viral minimum', desc: 'Pas de moment clipable = stream raté.', color: '#ef4444' },
              { num: 4, title: 'Respecte ta communauté', desc: 'Réponds au chat, retiens les noms, crée des inside jokes.', color: '#8b5cf6' },
              { num: 5, title: 'Zéro fake', desc: 'Pas de fausses réactions, pas de faux gains. L\'authenticité c\'est le seul moat.', color: '#06b6d4' },
            ].map((r) => (
              <div key={r.num} className="flex items-center gap-5 rounded-2xl p-5 transition-all duration-300 hover:translate-x-1"
                style={{ background: '#0d131b', border: '1px solid #1a2a3825' }}>
                <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black font-orbitron text-lg"
                  style={{ background: `${r.color}10`, color: r.color, border: `1px solid ${r.color}15` }}>
                  {r.num}
                </div>
                <div>
                  <div className="font-bold text-white">{r.title}</div>
                  <div className="text-sm text-[#8B949E] mt-0.5">{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ FUNNEL ═══ */}
        <section className="pb-24">
          <div className="text-center mb-12">
            <span className="text-4xl mb-4 block">🔥</span>
            <h2 className="text-3xl font-black font-orbitron text-white tracking-tight mb-3">Funnel</h2>
          </div>

          <div className="flex flex-col items-center gap-1 max-w-lg mx-auto">
            {[
              { name: 'TikTok / Shorts / Reels', sub: 'Clips 15-30s — postés dans l\'heure', color: '#ef4444', width: '100%', emoji: '📱' },
              { name: 'YouTube', sub: 'Compilations weekly 10-15 min', color: '#f59e0b', width: '80%', emoji: '🎥' },
              { name: 'Kick', sub: 'Streams live, la vraie communauté', color: '#00e701', width: '60%', emoji: '🎮' },
              { name: 'Cazyno', sub: 'Code promo Jacob, bonus inscription', color: '#00e701', width: '40%', emoji: '🎲' },
            ].map((f, i) => (
              <div key={i} className="w-full flex flex-col items-center">
                <div
                  className="rounded-2xl p-5 text-center transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    width: f.width,
                    background: `linear-gradient(135deg, ${f.color}10, ${f.color}05)`,
                    border: `1px solid ${f.color}18`,
                  }}
                >
                  <span className="text-lg">{f.emoji}</span>
                  <div className="font-bold text-white text-sm mt-1">{f.name}</div>
                  <div className="text-[11px] text-[#6b7280] mt-1">{f.sub}</div>
                </div>
                {i < 3 && (
                  <ArrowDown className="w-4 h-4 text-[#1a2a38] my-1" />
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-xs font-bold mt-8 px-4 py-3 rounded-xl mx-auto max-w-md"
            style={{ background: '#ef444410', color: '#ef4444', border: '1px solid #ef444415' }}>
            L'équipe clips est NON-NÉGOCIABLE. 1-2 personnes qui coupent et postent dans l'heure.
          </p>
        </section>

        {/* ═══ KPIs ═══ */}
        <section className="pb-24">
          <div className="text-center mb-12">
            <span className="text-4xl mb-4 block">📊</span>
            <h2 className="text-3xl font-black font-orbitron text-white tracking-tight mb-3">KPIs</h2>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: '#0d131b', border: '1px solid #1a2a3830' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#111a2560' }}>
                    <th className="text-left py-4 px-5 text-[#6b7280] font-bold text-[10px] uppercase tracking-widest">Métrique</th>
                    <th className="text-right py-4 px-5 text-[#6b7280] font-bold text-[10px] uppercase tracking-widest">M1</th>
                    <th className="text-right py-4 px-5 text-[#6b7280] font-bold text-[10px] uppercase tracking-widest">M3</th>
                    <th className="text-right py-4 px-5 text-[#6b7280] font-bold text-[10px] uppercase tracking-widest">M6</th>
                    <th className="text-right py-4 px-5 text-[10px] uppercase tracking-widest font-bold" style={{ color: '#00e701' }}>M12</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { metric: 'Viewers moyens', m1: '200-500', m3: '2k-5k', m6: '8k-15k', m12: '25k-30k+' },
                    { metric: 'Followers Kick', m1: '5k', m3: '30k', m6: '100k', m12: '300k+' },
                    { metric: 'TikTok followers', m1: '10k', m3: '100k', m6: '500k', m12: '1M+' },
                    { metric: 'YouTube subs', m1: '1k', m3: '15k', m6: '80k', m12: '250k+' },
                  ].map((row, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: '#1a2a3830' }}>
                      <td className="py-4 px-5 text-white font-semibold text-sm">{row.metric}</td>
                      <td className="py-4 px-5 text-right text-[#6b7280]">{row.m1}</td>
                      <td className="py-4 px-5 text-right text-[#8B949E]">{row.m3}</td>
                      <td className="py-4 px-5 text-right text-[#94a3b8]">{row.m6}</td>
                      <td className="py-4 px-5 text-right font-black font-orbitron" style={{ color: '#00e701' }}>{row.m12}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ═══ STRATÉGIE MARKETING ═══ */}
        <section className="pb-24">
          <div className="text-center mb-12">
            <span className="text-4xl mb-4 block">💰</span>
            <h2 className="text-3xl font-black font-orbitron text-white tracking-tight mb-3">Stratégie Marketing</h2>
            <p className="text-[#8B949E] text-sm">Budget total : <span className="text-[#00e701] font-bold font-orbitron">400 000€</span> — Répartition sur 12 mois</p>
          </div>

          {/* Budget breakdown */}
          <div className="space-y-3 mb-12">
            <h3 className="text-lg font-bold text-white font-orbitron mb-4">Répartition Budget</h3>
            {[
              { cat: 'Équipe (salaires)', amount: '144 000€', pct: 36, detail: '6 personnes × 2K€/mois moyenne × 12 mois', color: '#8b5cf6' },
              { cat: 'Influenceurs & Guests', amount: '80 000€', pct: 20, detail: '40 guests × 2K€ moyenne (certains gratuits, certains à 5K+)', color: '#f43f5e' },
              { cat: 'Voyages & Logistique', amount: '60 000€', pct: 15, detail: 'Billets, Airbnb, transport local × 10 villes', color: '#06b6d4' },
              { cat: 'Matériel & Tech', amount: '25 000€', pct: 6, detail: 'Setup complet stream + IRL + backup', color: '#f59e0b' },
              { cat: 'Giveaways & Activations', amount: '36 000€', pct: 9, detail: '3K€/mois en giveaways viewers + prix challenges', color: '#00e701' },
              { cat: 'Ads & Boost', amount: '30 000€', pct: 8, detail: 'TikTok Ads, YouTube Ads sur les meilleurs clips', color: '#ef4444' },
              { cat: 'Goodies & Merch', amount: '15 000€', pct: 4, detail: 'Production merch Jacob + Cazyno co-brand', color: '#ec4899' },
              { cat: 'Buffer imprévu', amount: '10 000€', pct: 2, detail: 'Urgences, opportunités, pivots', color: '#4b5c6f' },
            ].map((b) => (
              <div key={b.cat} className="rounded-xl p-4" style={{ background: '#0d131b', border: '1px solid #1a2a3825' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: b.color }} />
                    <span className="text-sm font-bold text-white">{b.cat}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#6b7280]">{b.pct}%</span>
                    <span className="text-sm font-bold font-orbitron" style={{ color: b.color }}>{b.amount}</span>
                  </div>
                </div>
                <div className="ml-5">
                  <div className="h-1.5 rounded-full mb-2 overflow-hidden" style={{ background: '#1a2a38' }}>
                    <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: b.color }} />
                  </div>
                  <span className="text-[11px] text-[#6b7280]">{b.detail}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Equipe détail */}
          <div className="mb-12">
            <h3 className="text-lg font-bold text-white font-orbitron mb-4">L'Équipe</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { role: 'Jacob', mission: 'Le visage. Stream, entertain, être lui-même.', salary: 'Revenus stream + sponsor', priority: 'Core' },
                { role: 'Caméraman / Réal IRL', mission: 'Cadrage, angles, qualité pro. Il follow Jacob partout dans la rue, gère les transitions.', salary: '~2 500€/mois', priority: 'Core' },
                { role: 'Éditeur Clips #1', mission: 'Coupe les moments forts PENDANT le stream. Poste sur TikTok/Shorts/Reels dans l\'heure. Le plus important du game.', salary: '~2 000€/mois', priority: 'Core' },
                { role: 'Éditeur Clips #2', mission: 'Compilations YouTube weekly, formats longs, best-of mensuels. Narratif + montage pro.', salary: '~2 000€/mois', priority: 'Core' },
                { role: 'Modérateurs Chat (×2)', mission: 'Gérer le chat en temps réel, ban les toxiques, faire monter l\'ambiance, lancer les votes.', salary: '~1 000€/mois chacun', priority: 'Core' },
                { role: 'Community Manager', mission: 'Réseaux sociaux hors-stream, engagement, réponses, story, teasers, programmation posts.', salary: '~1 500€/mois', priority: 'Mois 2+' },
                { role: 'Manager / Booker', mission: 'Trouver les guests, négocier les collabs, gérer le planning, relations influenceurs.', salary: '~2 000€/mois', priority: 'Mois 3+' },
                { role: 'Graphiste / Motion', mission: 'Overlays, alertes, thumbnails, assets marque Jacob × Cazyno. Fait tourner le branding.', salary: '~1 500€/mois (freelance)', priority: 'Mois 1+' },
              ].map((p) => (
                <div key={p.role} className="rounded-xl p-4" style={{ background: '#0d131b', border: '1px solid #1a2a3825' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-sm">{p.role}</span>
                    <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md"
                      style={{ background: p.priority === 'Core' ? '#00e70115' : '#f59e0b15', color: p.priority === 'Core' ? '#00e701' : '#f59e0b' }}>
                      {p.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8B949E] leading-relaxed mb-1">{p.mission}</p>
                  <span className="text-[10px] font-bold text-[#6b7280]">{p.salary}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stratégie marketing détaillée */}
          <div className="mb-12">
            <h3 className="text-lg font-bold text-white font-orbitron mb-4">Plan d'Action Marketing</h3>
            <div className="space-y-3">
              {[
                { phase: 'Mois 1-2', title: 'Build le personnage', actions: [
                  'Zéro mention du casino. Contenu IRL pur.',
                  '3 clips/jour minimum sur TikTok (15-30s, sous-titrés, format vertical)',
                  'Contacter 20 micro-influenceurs (10K-50K) pour des collabs gratuites mutuelles',
                  'Lancer les "10 Concepts Viraux" — un par semaine',
                  'Créer les comptes TikTok, YouTube, Instagram, Kick. Bio uniforme.',
                  'Budget Ads : $2K/mois en boost TikTok sur les clips les plus performants (>5% engagement)',
                ]},
                { phase: 'Mois 3-4', title: 'Accélérer la croissance', actions: [
                  '5 guests payants (1K-3K€ chacun) — des noms qui ramènent leur audience',
                  'Premiers guests féminins (commencer par le chill : Girl vs Boy, Rate My DMs)',
                  'Première mention organique du casino ("je joue sur Cazyno en off, c\'est marrant")',
                  'YouTube : 1 vidéo/semaine de 10-15min (compilation best-of)',
                  'Lancer le code promo Jacob sur Cazyno (pas encore pushé, juste disponible)',
                  'Premiers goodies : casquettes, t-shirts Jacob × Cazyno en édition limitée',
                ]},
                { phase: 'Mois 5-7', title: 'Intégrer le casino naturellement', actions: [
                  'Casino Night 2-3×/semaine — format "Chat Controls My Bets" et "Bankroll Challenge"',
                  'Guests plus gros (3K-5K€) — influenceurs 100K+ qui jouent avec Jacob en live',
                  'Créatrices MYM/adultes : format medium → spicy. Les créatrices jouent au casino aussi.',
                  'Activer les giveaways : $1K/semaine en crédits Cazyno pour les viewers',
                  'Merch drop #2 : hoodies, dés custom, jeu de cartes Jacob édition',
                  'Raid d\'autres streamers Kick avec les gains du casino',
                ]},
                { phase: 'Mois 8-12', title: 'Dominer et scaler', actions: [
                  'Jacob = la mascotte officielle de Cazyno. Logo sur les overlays, intros, merch.',
                  'Events physiques : meetups dans chaque ville (100-500 personnes)',
                  'Collab avec 2-3 gros streamers Kick (Adin Ross tier) — budget $10K-20K par collab',
                  'Lancer un programme d\'affiliation viewers (parraine un ami = bonus)',
                  'Merchandise premium : chaîne Jacob, dés en métal, poker set Cazyno édition limitée',
                  'Sponsoring de micro-events locaux (soirées, tournois, battles)',
                  'Documenter le behind-the-scenes du casino (visite des bureaux, l\'équipe, la tech)',
                ]},
              ].map((phase) => (
                <div key={phase.phase} className="rounded-xl p-5" style={{ background: '#0d131b', border: '1px solid #1a2a3825' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-black font-orbitron px-3 py-1.5 rounded-lg"
                      style={{ background: '#00e70110', color: '#00e701' }}>
                      {phase.phase}
                    </span>
                    <span className="font-bold text-white text-sm">{phase.title}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {phase.actions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#94a3b8]">
                        <span className="text-[#00e701] mt-1 shrink-0">›</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Goodies & Merch */}
          <div className="mb-12">
            <h3 className="text-lg font-bold text-white font-orbitron mb-4">Goodies & Merch</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { name: 'Casquette Jacob', desc: 'Logo brodé Jacob + petit logo Cazyno sur le côté. Snapback, noir/vert.', price: '~8€/unité', drop: 'Drop 1' },
                { name: 'T-Shirt "Les Autres Sont Dans Leur Chambre"', desc: 'Slogan signature sur un tee oversize noir. Qualité premium, sérigraphie.', price: '~10€/unité', drop: 'Drop 1' },
                { name: 'Hoodie Jacob × Cazyno', desc: 'Collab co-brandée. Logo avant, artwork full-back. Édition limitée numérotée.', price: '~18€/unité', drop: 'Drop 2' },
                { name: 'Jeu de Cartes Custom', desc: '52 cartes avec des inside jokes de la communauté. Dos = logo Cazyno. Boîte collector.', price: '~4€/unité', drop: 'Drop 2' },
                { name: 'Dés en Métal', desc: 'Set de 2 dés en métal gravés Jacob × Cazyno. Packaging velours. Le goodies premium.', price: '~6€/unité', drop: 'Drop 3' },
                { name: 'Poker Set Édition Limitée', desc: 'Mallette 200 jetons custom Cazyno, cartes Jacob, tapis feutrine. 500 exemplaires.', price: '~25€/unité', drop: 'Drop 3' },
                { name: 'Chaîne Jacob', desc: 'Pendentif plaqué or avec le logo. Le flex accessible. Les viewers la portent en meetup.', price: '~12€/unité', drop: 'Special' },
                { name: 'Stickers Pack', desc: '10 stickers avec les catchphrases de Jacob + emotes du chat. Glissés gratos dans chaque commande.', price: '~1€/pack', drop: 'Tous' },
                { name: 'Mug "Cashout or Continue"', desc: 'Le mug du matin avec le dilemme du soir. Logo Cazyno discret. Le goodies du quotidien.', price: '~5€/unité', drop: 'Drop 2' },
              ].map((g) => (
                <div key={g.name} className="rounded-xl p-4" style={{ background: '#0d131b', border: '1px solid #1a2a3825' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-sm">{g.name}</span>
                    <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md"
                      style={{ background: '#ec489915', color: '#ec4899' }}>
                      {g.drop}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8B949E] leading-relaxed mb-1">{g.desc}</p>
                  <span className="text-[10px] font-bold" style={{ color: '#00e701' }}>Coût prod : {g.price}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ MATÉRIEL STREAMING ═══ */}
        <section className="pb-24">
          <div className="text-center mb-12">
            <span className="text-4xl mb-4 block">🎛️</span>
            <h2 className="text-3xl font-black font-orbitron text-white tracking-tight mb-3">Setup Matériel</h2>
            <p className="text-[#8B949E] text-sm">Ce qu'il faut pour streamer en appart ET dans la rue avec une connexion solide</p>
          </div>

          <div className="space-y-6">
            {/* Indoor */}
            <div>
              <h3 className="text-sm font-bold text-[#f59e0b] font-orbitron uppercase tracking-widest mb-3">Setup Indoor (Appart/Studio)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { item: 'Sony A6400 + Sigma 16mm f/1.4', type: 'Caméra', price: '~1 200€', why: 'Autofocus oeil parfait, qualité ciné, compact. La référence des streamers pro.' },
                  { item: 'Elgato Cam Link 4K', type: 'Capture', price: '~120€', why: 'Transforme la Sony en webcam USB. Plug & play.' },
                  { item: 'Elgato Key Light (×2)', type: 'Lumière', price: '~300€', why: 'Lumière douce, contrôlable par app. L\'éclairage fait 80% de la qualité perçue.' },
                  { item: 'Shure SM7B + GoXLR Mini', type: 'Micro', price: '~600€', why: 'LE micro de streaming. Son podcast, zéro bruit ambiant. GoXLR pour le mix en live.' },
                  { item: 'Elgato Stream Deck MK.2', type: 'Contrôle', price: '~150€', why: 'Switch de scènes, sons, alertes en un bouton. Indispensable pour les transitions pro.' },
                  { item: 'Dual Monitor 27" (×2)', type: 'Écrans', price: '~500€', why: '1 pour le jeu/contenu, 1 pour le chat/OBS. Minimum pour streamer confortablement.' },
                  { item: 'PC Streaming (Ryzen 7 + RTX 4070)', type: 'PC', price: '~1 500€', why: 'Encodage x264 medium, multi-tâches, OBS sans lag. Pas besoin de plus.' },
                  { item: 'Fond vert Elgato ou décor physique', type: 'Décor', price: '~100-500€', why: 'Green screen pour la flexibilité OU un vrai setup déco (néons, étagères, branding).' },
                ].map((e) => (
                  <div key={e.item} className="rounded-xl p-3 flex items-start gap-3" style={{ background: '#0d131b', border: '1px solid #1a2a3820' }}>
                    <div className="shrink-0 mt-0.5">
                      <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md"
                        style={{ background: '#f59e0b12', color: '#f59e0b' }}>{e.type}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-sm">{e.item}</div>
                      <div className="text-[11px] text-[#6b7280] mt-0.5">{e.why}</div>
                      <div className="text-[11px] font-bold mt-1" style={{ color: '#00e701' }}>{e.price}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-right text-sm font-bold font-orbitron" style={{ color: '#f59e0b' }}>
                Total indoor : ~4 470€
              </div>
            </div>

            {/* IRL / Outdoor */}
            <div>
              <h3 className="text-sm font-bold text-[#06b6d4] font-orbitron uppercase tracking-widest mb-3">Setup IRL (Rue / Extérieur)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { item: 'iPhone 15 Pro Max', type: 'Caméra', price: '~1 400€', why: 'La meilleure caméra IRL. Stabilisation dingue, 4K, ProRes. Moins suspect qu\'une grosse caméra dans la rue.' },
                  { item: 'DJI Osmo Mobile 7P', type: 'Stabilisation', price: '~100€', why: 'Gimbal pour le téléphone. Plus de shaky cam. Tracking automatique du visage.' },
                  { item: 'Rode Wireless PRO', type: 'Micro', price: '~280€', why: '2 émetteurs + 1 récepteur. Son broadcast même dans le bruit de la rue. 32-bit float = jamais de saturation.' },
                  { item: 'Insta360 Flow Pro', type: 'Backup', price: '~160€', why: 'Gimbal avec tracking AI. Deuxième angle, time-lapses, B-roll automatique.' },
                  { item: 'Netgear Nighthawk M6 (5G)', type: 'Internet', price: '~450€', why: 'Routeur 5G portable. WiFi 6E. LA pièce la plus importante du setup IRL. Connexion stable partout.' },
                  { item: '2× cartes SIM data illimitée', type: 'Data', price: '~80€/mois', why: 'Deux opérateurs différents. Si un réseau tombe, l\'autre prend le relais. Jamais de coupure.' },
                  { item: 'Anker PowerCore 26800mAh (×2)', type: 'Batterie', price: '~120€', why: '2 batteries pour 12h+ d\'autonomie. Charge rapide USB-C. Le stream ne s\'arrête jamais.' },
                  { item: 'Sac à dos Peak Design Everyday', type: 'Transport', price: '~250€', why: 'Tout le matos tient dedans. Accès latéral rapide, résistant à la pluie, pas l\'air d\'un sac tech.' },
                  { item: 'IRL Streaming via Belabox / IRLToolkit', type: 'Software', price: '~30€/mois', why: 'Bonding de connexion (combine 4G + 5G + WiFi). Encode sur le cloud. La qualité d\'un stream PC... depuis un téléphone.' },
                  { item: 'GoPro Hero 13 Black', type: 'Backup cam', price: '~400€', why: 'Pour les situations extrêmes : eau, sport, action. Angle ultra-wide, étanche, indestructible.' },
                ].map((e) => (
                  <div key={e.item} className="rounded-xl p-3 flex items-start gap-3" style={{ background: '#0d131b', border: '1px solid #1a2a3820' }}>
                    <div className="shrink-0 mt-0.5">
                      <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md"
                        style={{ background: '#06b6d412', color: '#06b6d4' }}>{e.type}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-sm">{e.item}</div>
                      <div className="text-[11px] text-[#6b7280] mt-0.5">{e.why}</div>
                      <div className="text-[11px] font-bold mt-1" style={{ color: '#00e701' }}>{e.price}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-right text-sm font-bold font-orbitron" style={{ color: '#06b6d4' }}>
                Total IRL : ~3 270€ + ~110€/mois
              </div>
            </div>

            {/* Total */}
            <div className="rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg, #00e70108, #8b5cf608)', border: '1px solid #00e70115' }}>
              <div className="text-sm text-[#8B949E] mb-1">Setup complet (indoor + IRL)</div>
              <div className="text-3xl font-black font-orbitron" style={{ color: '#00e701' }}>~7 740€</div>
              <div className="text-xs text-[#6b7280] mt-1">+ ~110€/mois de récurrent (data + software)</div>
            </div>
          </div>
        </section>

        {/* ═══ CLOSING ═══ */}
        <section className="pb-20 text-center">
          <div className="rounded-2xl p-10 max-w-2xl mx-auto" style={{
            background: 'linear-gradient(135deg, #00e70108, #8b5cf608)',
            border: '1px solid #1a2a3830',
          }}>
            <p className="text-lg font-bold text-white leading-relaxed mb-3">
              "Les autres sont dans leur chambre."
            </p>
            <p className="text-sm text-[#8B949E] leading-relaxed">
              Aucun streamer casino ne fait ça.<br />
              <span className="font-bold text-white">Jacob est dehors, dans le monde.</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
