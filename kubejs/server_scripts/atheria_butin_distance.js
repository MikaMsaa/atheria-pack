// Atheria - butin selon le danger du lieu et l'avancée dans les quêtes (Mika 28/11 : « coffres de toutes les villes,
// plus c'est loin et dangereux et plus on avance dans les quêtes, meilleur est le butin »). Remplace la règle du 22/11
// (distance au spawn seule).
// Palier 1 à 5 du coffre = palier du lieu (grille du fil de la carte, paliers.json du 28/11 : case de 32 blocs,
// mer comptée 1, +1 sous y 40) + bonus de quêtes (+1 après le chapitre 2, +2 après le chapitre 4), au plus 5.
// Les tables d'origine des coffres ne changent pas : chaque palier ajoute des chances de tirer en plus dans les
// tables atheria:inject/*. Le joueur qui ouvre (Lootr : chacun le sien) est à côté du coffre : on prend sa position.
var BUTIN_PALIERS = {
  case: 32, origine: -6000, cote: 375, sousTerreY: 40, max: 5,
  // [chapitre FTB Quests (id), bonus] : le plus grand bonus atteint compte
  chapitres: [['74D81718B49D6FD1', 1], ['6A0FFFBDABB1858F', 2]],
  // [palier mini, chance, table ajoutée] ; les lignes s'additionnent (un palier 5 tire toutes les lignes) ;
  // palier 1 : rien en plus, comme avant près du réveil
  ajouts: [
    [2, 0.30, 'atheria:inject/munitions_pistolet'],
    [2, 0.15, 'atheria:inject/soins_rares'],
    [3, 0.15, 'atheria:inject/munitions_militaires'],
    [3, 0.05, 'atheria:inject/equipement_militaire'],
    [4, 0.25, 'atheria:inject/munitions_militaires'],
    [4, 0.10, 'atheria:inject/equipement_militaire'],
    [4, 0.03, 'atheria:inject/arme_longue'],
    [5, 0.20, 'atheria:inject/munitions_militaires'],
    [5, 0.10, 'atheria:inject/equipement_militaire'],
    [5, 0.04, 'atheria:inject/arme_longue'],
    [5, 0.06, 'atheria:inject/explosifs']
  ],
  // une rangée par ligne de cases (z), de l'ouest à l'est ; lettre a..f = palier 0..5, suivie du nombre de cases et « ; »
  grille: (
    'a375; a375; a375; a375; a375; a375; a375; a104;d2;a269; a104;d2;a86;c3;a180; a192;c3;a180; a192;c3;a180; a192;c3;a180; a375; a375; a375; a118;d2;a37;c4;a214; a97;d2;a14;d' +
    '11;c3;a3;c7;a7;c31;a12;c4;a184; a93;d9;a9;d12;c54;a4;c12;a182; a90;d33;c71;a181; a89;d33;c73;a180; a87;d35;c73;a180; a87;d34;c74;a180; a87;d34;c75;a179; a87;d33;c76;a179;' +
    ' a87;d33;c78;a177; a86;d33;c9;e6;c65;a176; a86;d32;c10;e6;c67;a174; a85;d33;c10;e6;c70;a171; a84;d33;c11;e6;c74;a167; a83;d34;c11;e6;c76;a165; a83;d33;c12;e6;c77;a164; a8' +
    '2;d34;c97;a162; a82;d33;c98;a162; a82;d33;c99;a161; a82;d33;c85;f5;c9;a161; a81;d33;c86;f5;c9;a161; a81;d33;c86;f5;c9;a161; a81;d32;c87;f5;c10;a160; a81;d32;c87;f5;c11;a1' +
    '59; a81;d31;c104;a159; a81;d31;c105;a158; a81;d31;c105;a158; a80;d31;c106;a158; a79;d32;c106;a158; a79;d31;c107;a158; a79;d31;c107;a158; a78;d32;c107;a158; a78;d31;c108;a' +
    '158; a77;d32;c108;a158; a77;d32;c91;bc17;a157; a77;d31;c91;b2;c17;a157; a76;d32;c110;a157; a76;d32;c111;a156; a76;d31;c113;a155; a77;d30;c118;a150; a76;d31;c121;a147; a75' +
    ';d32;c123;a145; a74;d32;c125;a144; a73;d33;c125;a144; a69;d37;c125;a144; a67;d38;c127;a143; a65;d40;c127;a143; a64;d41;c127;a143; a63;d42;c128;a142; a62;d42;c129;a142; a6' +
    '1;d43;c129;a142; a61;d43;c129;a142; a55;da5;d43;c131;a140; a54;d2;a5;d43;c131;a140; a55;da6;d41;c134;a138; a63;d40;c134;a138; a63;d40;c134;a138; a62;d41;c134;a138; a62;d4' +
    '1;c134;a138; a62;d40;c135;a138; a54;d2;a7;d39;c137;a136; a52;d5;a6;d39;c139;a134; a52;d6;a4;d40;c141;a132; a51;d8;a2;d41;c142;a131; a48;d54;c142;a131; a48;d54;c142;ba130;' +
    ' a47;d54;c142;b3;a8;ba120; a48;d53;c141;b4;a2;b10;a117; a48;d53;c140;b19;a115; a45;d56;c139;b22;a113; a44;d57;c138;b25;a111; a44;d57;c138;b26;a110; a45;d56;c137;b28;a109;' +
    ' a45;d56;c137;b29;a108; a44;d57;c136;b41;a97; a43;d58;c136;b41;a97; a40;d61;c135;b42;a97; a40;d60;c136;b42;a97; a40;d60;c136;b42;a97; a33;d2;a5;d60;c135;b44;a96; a33;d2;a' +
    '5;d60;c135;b45;a95; a33;d2;a5;d60;c135;b45;a95; a40;d60;c135;b46;a94; a40;d60;c135;b43;ab2;a94; a40;d60;c135;b18;e4;b21;a97; a40;d60;c135;b18;e4;b21;a97; a40;d60;c135;b18' +
    ';e4;b21;a97; a40;d60;c135;b18;e4;b21;a97; a40;d60;c135;b36;a104; a41;d59;c135;b37;a103; a41;d59;c135;b38;a102; a41;d59;c135;b36;a104; a42;d58;c127;d15;b28;a105; a42;d58;c' +
    '127;d15;b28;a105; a43;d57;c127;d15;b27;a106; a43;d57;c127;d15;b27;a106; a45;d56;c126;d15;b27;a7;ba98; a45;d56;c126;d15;b26;a7;b2;a98; a45;d57;c125;d15;b26;a7;b4;a96; a45;' +
    'd57;c125;d15;b26;a7;b5;a95; a45;d58;c124;d15;b26;a6;b6;a95; a45;d58;c124;d15;b26;a6;b6;a95; a45;d59;c123;d15;b16;c14;a2;b6;a95; a45;d60;c122;d15;b16;c14;a2;b6;a95; a34;da' +
    '10;d60;c122;d15;b16;c14;a2;b6;a95; a33;d2;a10;d60;c137;b16;c14;a3;b4;a96; a33;da11;d60;c138;b15;c14;a4;b4;a95; a45;d60;c139;b14;c14;a4;b4;a95; a45;d61;c139;b13;c14;a7;ba9' +
    '5; a44;d63;c140;b11;c14;a103; a43;d65;c140;b10;c14;a103; a43;d66;c141;b8;c14;a103; a42;d68;c143;b5;c14;ba102; a42;d69;c145;b2;c16;a101; a43;d69;c164;a99; a42;d71;c164;a98' +
    '; a42;d72;c163;a33;f3;a62; a42;d72;c153;e16;a21;f11;a60; a42;d73;c152;e16;a17;f18;a57; a43;d72;c152;e16;a16;f23;a53; a43;d72;c152;e16;a14;f27;a51; a43;d73;c151;e16;a12;f2' +
    '9;a51; a43;d74;c150;e16;a12;f30;a50; a44;d74;c149;e16;a11;f32;a49; a44;d74;c149;e16;a11;f33;a48; a44;d73;c150;e16;f3;a8;f35;a46; a43;d74;c150;e16;f3;a7;f37;a45; a42;d75;c' +
    '150;e16;f3;a7;f38;a44; a42;d75;c150;e16;f3;a7;f39;a43; a41;d74;c152;e2;f18;a5;f42;a41; a41;d73;c153;e2;f18;a5;f45;a38; a41;d73;c153;e2;f18;a5;f46;a37; a41;d72;c156;f18;a4' +
    ';f48;a36; a40;d73;c156;f18;a4;f50;a34; a40;d73;c44;a3;c109;f18;a3;f52;a33; a39;d74;c42;a6;c108;f18;a3;f53;a32; a39;d73;c43;a6;c108;f18;a4;f53;a31; a39;d73;c44;ac112;f18;a' +
    '4;f54;a30; a38;d75;c43;ac112;f18;a4;f55;a29; a38;d76;c155;f18;a4;f55;a29; a38;d76;c155;f18;a3;f26;a2;f29;a28; a38;d76;c45;ac109;f18;a2;f25;a5;f29;a27; a38;d76;c45;ac109;f' +
    '18;a2;f24;a6;f29;a27; a37;d78;c154;f18;af25;a7;f29;a26; a37;d81;c151;f18;a2;f24;a7;f29;a26; a37;d82;c150;f18;a2;f24;a6;f30;a26; a37;d82;c41;ac108;f18;a2;f25;a5;f29;a27; a' +
    '37;d82;c41;ac108;f18;a2;f59;a27; a36;d83;c41;a2;c107;f79;a27; a36;d83;c42;ac107;f12;e5;f62;a27; a36;d83;c43;ac106;f12;e5;f62;a27; a26;d2;a8;d82;c45;ac105;f12;e5;f62;a27; ' +
    'a26;d2;a8;d81;c46;a2;c104;f12;e5;fa4;f57;a27; a37;d80;c48;ac103;f3;c5;f10;a5;f56;a27; a37;d80;c49;a2;c101;f3;c5;f10;a5;f55;a28; a38;d80;c49;ac117;a8;f54;a28; a38;d80;c50;' +
    'a2;c115;a8;f54;a28; a39;d79;c51;a2;c113;a10;f52;a29; a39;d80;c51;ac113;a10;f52;a29; a39;d81;c51;ac64;e3;c45;a10;f51;a30; a39;d88;c45;a2;c58;e12;c40;a11;f50;a30; a40;d87;c' +
    '46;ac52;e19;c39;a12;f48;a31; a40;d87;c47;ac50;e22;c33;a17;f45;a33; a41;d87;c47;ac45;e28;c28;a20;f44;a34; a41;d88;c46;a2;c42;e30;c7;ece3;c4;e2;c8;a23;f42;a35; a33;d5;a3;d8' +
    '8;c47;a2;c40;e32;c4;ea3;e10;c4;a7;c5;a15;f40;a36; a33;d5;a4;d87;c48;a2;c38;e35;a11;e5;a8;c8;a16;f37;a38; a34;d4;a4;d87;c49;a2;c34;e37;a23;c11;a18;f33;a39; a35;d2;a5;d87;c' +
    '50;ac32;e38;a2;e10;a7;e11;c6;a21;f28;a40; a42;d88;c50;ac29;e25;c5;e9;a2;e34;c2;a26;f20;a42; a42;d87;c8;d5;c39;acdcdc16;e33;c5;e8;a2;e38;a27;f16;a44; a42;d87;c3;dcd9;c38;d' +
    'ad6;c10;e36;c5;e7;a2;e40;a29;f10;a47; a43;d102;c29;d4;cd4;ad6;e2;c5;e38;c5;e5;a3;e42;a33;f2;a50; a43;d102;c27;d11;a2;d6;e52;a4;e44;a84; a43;d103;c15;d4;c5;d14;a2;d7;e47;a' +
    '6;e46;a83; a44;d103;c11;d10;cd16;a2;d8;e42;a4;e52;a82; a44;d105;c8;d29;ad9;e40;a4;e53;a82; a43;d108;c6;d30;ad2;a11;e33;a3;e57;a81; a44;d109;c3;d31;a3;d10;ea4;e27;a3;e59;a' +
    '81; a44;d110;cd33;ad11;e4;a3;e23;a4;e61;a80; a45;d156;e6;a3;e18;a3;e63;a81; a45;d156;e8;a5;e11;a4;e65;a81; a45;d138;e2;d17;e10;a7;e4;a4;e67;a81; a45;d131;ed3;e7;d16;e14;a' +
    '7;e71;a80; a45;d130;e14;d15;e91;a80; a45;d115;e4;d9;e17;d14;e91;a80; a45;d114;e8;d3;e22;d13;e90;a80; a45;d113;e34;d14;e88;a81; a45;d113;e35;d13;e88;a81; a46;d112;e35;d14;' +
    'e38;a5;e44;a81; a47;d110;e38;d12;e37;a7;e43;a81; a47;d110;e38;d12;e37;a6;e44;a81; a48;d108;e40;d12;e37;a5;e44;a81; a49;d108;e40;d11;e37;a5;e44;a81; a49;d108;e40;d10;e38;a' +
    '4;e45;a81; a50;d102;a2;d3;e40;d10;e87;a81; a51;d99;a2;d5;e40;d11;e86;a81; a52;d96;a3;d7;e39;d11;e86;a81; a52;d95;ad9;e40;d11;e85;a82; a52;d92;a3;d10;e40;d14;e82;a82; a53;' +
    'd89;a3;d12;e40;d15;e81;a82; a53;d85;a4;d17;e39;d15;e68;a94; a54;d82;a3;d20;e39;d16;e53;a108; a54;d15;e5;d61;a2;d22;e40;d16;e51;a5;e2;a8;e7;a87; a54;d15;e5;d58;a3;d24;e40;' +
    'd17;e48;a3;e26;a82; a54;d15;e5;d52;a7;d27;e39;d18;e46;a3;e29;a80; a54;d15;e5;d49;a6;d31;e40;d19;e44;a2;e34;a76; a54;d15;e5;d38;a12;d36;e42;d18;e42;a2;e37;a74; a55;d56;a3;' +
    'd4;a2;d40;e45;d15;e17;a12;e11;a3;e41;a71; a55;d55;a2;d48;e45;d16;e14;a4;e7;a6;e7;a3;e43;a70; a56;d2;ad50;a2;d49;e47;d14;e11;a3;e15;a10;e45;a70; a60;d48;a2;d52;e45;d15;e9;' +
    'ae73;a70; a60;d48;a2;d52;e46;d14;e8;ae75;a69; a60;d47;a2;d56;e44;d13;e7;ae76;a69; a60;d46;a2;d60;e42;d12;e6;ae77;a69; a61;d44;a2;d62;e41;d12;e5;ae79;a68; a61;d43;a2;d64;e' +
    '41;d13;e2;ae80;a68; a61;d41;a3;d65;e41;d14;ae81;a68; a62;d39;a3;d66;e41;d5;ad7;ae83;a67; a62;d37;a4;d68;e40;d6;a3;da3;d2;e82;a67; a63;d35;a3;d71;e40;d15;e81;a67; a63;d33;' +
    'a4;d73;e39;d15;e81;a67; a64;d30;a4;d76;e39;d15;e81;a66; a65;d27;a4;d78;e40;d14;e81;a66; a64;d26;a5;d79;e42;d12;e81;a66; a64;d24;a4;d82;e41;d12;e82;a6;e2;a58; a64;d23;a3;d' +
    '85;e40;d11;e83;a6;e2;a58; a64;d23;a2;d86;e39;d12;e83;a66; a65;d22;a2;d87;e38;d12;e83;a66; a66;d21;ad88;e38;d12;e83;a66; a66;d21;ad87;e40;d11;e84;a65; a67;d20;ad88;e39;d8;' +
    'e2;de84;a65; a67;d19;a2;d89;e39;d5;e89;a65; a68;d18;a2;d89;e39;d4;e90;a65; a69;d16;a3;d90;e38;d4;e90;a65; a69;d14;a4;d91;e39;d2;e91;a65; a69;d13;a4;d92;e40;de91;a65; a69;' +
    'd11;a4;d94;e132;a65; a69;d10;a3;d97;e130;a66; a69;d9;a3;d99;e130;a65; a69;d7;a4;d100;e130;a65; a78;d103;e130;a64; a77;d104;e130;a64; a68;da5;d108;e130;a63; a68;d114;e131;' +
    'a62; a69;d114;e130;a62; a70;d112;e131;a62; a70;d108;a2;de132;a62; a70;d106;a3;d2;e132;a62; a71;d100;a4;d5;e132;a63; a71;d97;a3;d7;e134;a63; a71;d95;a3;d9;e134;a63; a71;d9' +
    '3;a2;d9;e137;a63; a71;d92;a2;d10;e137;a63; a71;d91;a2;d12;e135;a64; a70;d91;a2;d14;e133;a65; a71;d89;a2;d15;e133;a65; a71;d89;a2;d16;e131;a66; a72;d87;a2;d17;e131;a66; a7' +
    '2;d87;ad18;e20;d2;e108;a67; a72;d87;ad19;e16;d6;e107;a67; a73;d86;ad20;e13;d9;e105;a68; a73;d85;ad22;e10;d11;e105;a68; a73;d85;ad22;e8;d12;e106;a68; a73;d84;a2;d41;e108;a' +
    '67; a74;d80;a3;d43;e108;a67; a74;d77;a5;d46;e106;a67; a75;d75;a3;d50;e106;a66; a75;d73;a2;d54;e105;a66; a75;d72;a3;d56;e104;a65; a77;d69;a2;d60;e102;a65; a81;d64;a2;d64;e' +
    '100;a64; a82;d27;e2;d6;e3;d24;a2;d68;e98;a63; a85;d22;e15;d22;ad72;e95;a63; a87;d19;e18;d19;a2;d74;e93;a63; a88;d16;e22;d16;a2;d77;e91;a63; a94;d9;e23;d16;a2;d78;e91;a62;' +
    ' a97;d6;e23;d15;a2;d81;e89;a62; a99;d4;e23;d14;a2;d82;e88;a63; a102;de24;d12;a2;d85;e86;a63; a104;e23;d11;a2;d88;e83;a64; a105;e23;d10;ad89;e82;a65; a108;e21;d8;a2;d90;e8' +
    '0;a66; a109;e21;d6;a2;d93;e78;a66; a110;e20;d6;a2;d93;e78;a66; a88;ea22;e20;d4;a2;d95;e76;a67; a84;e10;a18;e21;da2;d96;e75;a68; a81;e15;a16;e21;a3;d73;e7;d16;e75;a68; a79' +
    ';e19;a15;e19;a3;d74;e7;d18;e72;a69; a76;e25;a13;e17;a3;ed74;e7;d20;e70;a69; a75;e28;a11;e16;a3;e3;d73;e7;d22;e69;a68; a75;e29;a10;e15;a3;e4;d73;e7;d24;e66;a69; a73;e33;a9' +
    ';e13;a3;e5;d73;e7;d25;e64;a70; a72;e34;a9;e12;a3;e6;d73;e7;d27;e61;a71; a71;e36;a8;e11;a3;e8;d109;e57;a72; a70;e38;a8;e8;a4;e9;d110;e55;a73; a69;e39;a8;e6;a5;e10;d110;e54' +
    ';a74; a69;e39;a9;e2;a6;e12;d110;e53;a75; a68;e40;a14;e15;d111;e51;a76; a67;e41;a12;e17;d110;ede49;a77; a66;e42;a10;e20;d111;e48;a78; a66;e42;a11;e19;d111;e48;a78; a66;e43' +
    ';a10;e20;d110;e48;a25;f2;a3;f7;a41; a64;e45;a11;e19;d111;e46;a22;f18;a39; a64;e45;a11;e19;d113;ed4;e38;a19;f24;a37; a64;e46;a11;e18;d118;e38;a18;f26;a36; a64;e46;a11;e19;' +
    'd117;e37;da15;f31;a34; a64;e47;a11;e18;d118;e19;d17;a15;f34;a32; a64;e47;a12;e17;d118;e19;d17;a14;f36;a31; a64;e47;a12;e18;d118;e16;d19;a13;f39;a29; a64;e47;a13;e18;d118;' +
    'e13;d21;a13;f40;a28; a64;e47;a13;e19;d118;e11;d21;a13;f42;a27; a65;e46;a14;e19;d118;e9;d22;a13;f43;a26; a65;e46;a15;e19;d118;e7;d22;a14;f43;a26; a66;e44;a16;e19;d120;e5;d' +
    '22;a14;f44;a25; a66;e44;a16;e19;d147;a14;f44;a25; a66;e44;a16;e19;d147;a14;f45;a24; a67;e42;a17;e19;d147;a14;f45;a24; a67;e42;a17;e21;d145;a15;f44;a24; a67;e41;a18;e21;d1' +
    '45;a15;f44;a24; a67;e41;a18;e22;d144;a15;f44;a24; a69;e39;a19;e21;d144;a16;f43;a24; a69;e38;a20;e23;d142;a16;f42;a25; a70;e36;a21;e23;d142;a17;f41;a25; a71;e34;a22;e23;d1' +
    '41;a19;f39;a26; a73;e30;a25;e22;d141;a20;f38;a26; a74;e29;a25;e22;d141;a21;f36;a27; a75;e26;a28;ed4;e2;d3;e10;d141;a23;f34;a28; a78;e21;a28;d15;e7;d141;a25;f31;a29; a79;e' +
    '18;a29;d22;ed140;a26;f31;a29; a82;e3;a40;d164;a28;f28;a30; a126;d162;a31;f23;a33; a129;d159;a33;f20;a34; a130;d158;a42;f6;a39; a132;d134;a2;d20;a87; a132;d134;a4;d18;a87;' +
    ' a135;d128;a10;d12;a90; a136;d127;a12;d10;a90; a136;d127;a13;d6;a93; a138;d123;a114; a138;d121;a116; a139;d119;a117; a150;d107;a118; a154;d78;a7;d4;a132; a158;d72;a145; a' +
    '161;d34;a4;d9;a6;d7;ad6;a147; a163;d4;a9;d17;a182; a183;d4;a188; a375; a375; a144;d3;a228; a143;d4;a228; a144;d3;a228; a375; a375; a375; a375; a375; a375; a375;'  )
}
var BUTIN_GRILLE = null
var BUTIN_BONUS = {}

function atheriaButinGrille() {
  if (BUTIN_GRILLE) return BUTIN_GRILLE
  var g = []
  BUTIN_PALIERS.grille.split(' ').forEach(r => {
    var l = [], i = 0
    while (i < r.length) {
      var v = 'abcdef'.indexOf(r.charAt(i++)), n = 1
      if (i < r.length && r.charAt(i) >= '0' && r.charAt(i) <= '9') { var j = r.indexOf(';', i); n = parseInt(r.substring(i, j)); i = j + 1 }
      for (var k = 0; k < n; k++) l.push(v)
    }
    g.push(l)
  })
  BUTIN_GRILLE = g
  return g
}

// palier du lieu (1 à 5) ; hors de la carte : 1
function atheriaPalierLieu(x, y, z) {
  var P = BUTIN_PALIERS, g = atheriaButinGrille()
  var j = Math.floor((z - P.origine) / P.case), i = Math.floor((x - P.origine) / P.case)
  var v = j >= 0 && j < g.length && i >= 0 && i < g[j].length ? g[j][i] : 1
  if (v < 1) v = 1
  if (y < P.sousTerreY) v++
  return Math.min(P.max, v)
}

// bonus de quêtes (chapitres terminés par l'équipe du joueur), gardé une minute
function atheriaBonusQuetes(p) {
  var k = String(p.username), c = BUTIN_BONUS[k]
  if (c && Date.now() - c.t < 60000) return c.b
  var b = 0
  try {
    var SQF = Java.loadClass('dev.ftb.mods.ftbquests.quest.ServerQuestFile'), QOB = Java.loadClass('dev.ftb.mods.ftbquests.quest.QuestObjectBase')
    var f = SQF.INSTANCE, td = f['getOrCreateTeamData(net.minecraft.world.entity.Entity)'](p)
    BUTIN_PALIERS.chapitres.forEach(ch => {
      var chap = f.getChapter(QOB.parseCodeString(ch[0]))
      if (chap && td.isCompleted(chap) && ch[1] > b) b = ch[1]
    })
  } catch (x) { console.error('[Atheria butin] quêtes : ' + x) }
  BUTIN_BONUS[k] = { t: Date.now(), b: b }
  return b
}

function atheriaPalierButin(p) {
  return Math.min(BUTIN_PALIERS.max, atheriaPalierLieu(Math.floor(p.x), Math.floor(p.y), Math.floor(p.z)) + atheriaBonusQuetes(p))
}

LootJS.modifiers(event => {
  BUTIN_PALIERS.ajouts.forEach(a => {
    event.addTableModifier(LootType.CHEST)
      .matchPlayerCustom(joueur => atheriaPalierButin(joueur) >= a[0])
      .randomChance(a[1])
      .addLoot(LootEntry.reference(a[2]))
  })
  // compétence « Fouilleur » (arbre Survivant) : un objet de survie de plus de temps en temps
  event.addTableModifier(LootType.CHEST)
    .matchPlayerCustom(joueur => joueur.tags.contains('skill_eclaireur_2'))
    .randomChance(0.2)
    .addLoot(LootEntry.reference('atheria:inject/fournitures'))
})
