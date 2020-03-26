const Signalstellung = {

// Added manually
	
  'system\\Route_SignalS.3ds' : { 
	Name : {DE : `Start Fahrstraße`, EN : `Start predefined line`, FR : `Parcour prédéfini de démarrage`, }, 
	Pos : { }},
  'system\\Route_SignalZ.3ds' : { 
	Name : {DE : `Ende Fahrstraße`, EN : `End predefined line`, FR : `Parcour prédéfini de fin`, }, 
	Pos : { }},
  'Schranke2_SM2' : { Name : 'Eisenbahnschranke 2', Pos : { 1 : 'Fahrt', 2 : 'Halt', }},
	
// Created with EEP_Signale.html

  "Ampel_1" : {
    Name : {DE : "Ampel 1", EN : "Rd_Traffic_light_1", FR : "R_Carrefour simple_1", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Go", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Stop", FR : "Arrêt", },
  }},
  "Ampel_2" : {
    Name : {DE : "Ampel 2", EN : "Rd_Traffic_light_2", FR : "R_Carrefour double", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Go", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Stop", FR : "Arrêt", },
  }},
  "BS1_HL_Gruppe_1_55" : {
    Name : {DE : "BS1_HL_Gruppe_1_55", EN : "Ra_BS1_HL_Gruppe_1_55", FR : "F_BS1_HL_Gruppe_1_55", },
    Pos : {
      1 : {DE : "Hl 13; Hp 0", EN : "Hl 13; Hp 0", FR : "Hl13_Carré", },
      2 : {DE : "Hl 1", EN : "Hl 1", FR : "Hl1_Voie libre", },
      3 : {DE : "Hl 10", EN : "Hl 10", FR : "Hl10_VMax=>Halte orange", },
      4 : {DE : "Hl 7", EN : "Hl 7", FR : "Hl7_VMax=>V60/40 orange clignottant", },
      5 : {DE : "Hl 4", EN : "Hl 4", FR : "Hl4_VMax=>V100 vert clignottant", },
      6 : {DE : "Ra 12", EN : "Ra 12", FR : "Ra12_Triage 30km/h", },
      7 : {DE : "Zs1", EN : "Zs1", FR : "Zs1_Marche à vue 40km/h", },
  }},
  "BS1_HL_Gruppe_7_55" : {
    Name : {DE : "BS1_HL_Gruppe_7_55", EN : "Ra_BS1_HL_Gruppe_7_55", FR : "F_BS1_HL_Gruppe_7_55", },
    Pos : {
      1 : {DE : "Hl 13; Hp 0", EN : "Hl 13; Hp 0", FR : "Hl 13; Hp 0", },
      2 : {DE : "Hl 1", EN : "Hl 1", FR : "Hl 1", },
      3 : {DE : "Hl 10", EN : "Hl 10", FR : "Hl 10", },
      4 : {DE : "Hl 9a", EN : "Hl 9a", FR : "Hl 9a", },
      5 : {DE : "Hl 12a", EN : "Hl 12a", FR : "Hl 12a", },
      6 : {DE : "Zs 1", EN : "Zs 1", FR : "Zs 1", },
  }},
  "BS1_KS1_BRK_MAS_oM2_4" : {
    Name : {DE : "BS1_KS1_BRK_MAS_oM2_4", EN : "Ra_BS1_KS1_BRK_MAS no mast2_4", FR : "F_BS1_KS1_BRK_MAS_oM2_4", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "BS1_KS1_BRK_MAS_oM2_p10_4" : {
    Name : {DE : "BS1_KS1_BRK_MAS_oM2_p10_4", EN : "Ra_BS1_KS1_BRK_MAS no Mast2_p10_4", FR : "F_BS1_KS1_BRK_MAS_oM2_p10_4", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "BS1_KS1_BRK_MAS_p10_4" : {
    Name : {DE : "BS1_KS1_BRK_MAS_p10_4", EN : "Ra_BS1_KS1_BRK_MAS_p10_4", FR : "F_BS1_KS1_BRK_MAS_p10_4", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "BS1_KS1_HS_oVS_SFS_5" : {
    Name : {DE : "BS1_KS1_HS_oVS_SFS_v7", EN : "BS1_KS1_HS_oVS_SFS_v7", FR : "BS1_KS1_HS_oVS_SFS_v7", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "BS1_KS1_MAS_A_oVS_SFS_5" : {
    Name : {DE : "BS1_KS1_MAS_A_oVS_SFS_v7", EN : "BS1_KS1_MAS_A_oVS_SFS_v7", FR : "BS1_KS1_MAS_A_oVS_SFS_v7", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "BS1_KS1_MAS_links_oVS_SFS_5" : {
    Name : {DE : "BS1_KS1_MAS_links_oVS_SFS_v7", EN : "BS1_KS1_MAS_left_oVS_SFS_v7", FR : "BS1_KS1_MAS_links_oVS_SFS_v7", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "BS1_KS1_MAS_links_SFS_5" : {
    Name : {DE : "BS1_KS1_MAS_links_SFS_v7", EN : "BS1_KS1_MAS_left_SFS_v7", FR : "BS1_KS1_MAS_links_SFS_v7", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "BS1_KS1_MAS_oVS_li_Zs380_SFS_5" : {
    Name : {DE : "BS1_KS1_MAS_oVS_li_Zs380_SFS_v7", EN : "BS1_KS1_MAS_oVS_left_Zs380_SFS_v7", FR : "BS1_KS1_MAS_oVS_li_Zs380_SFS_v7", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "BS1_KS1_MAS_oVS_SFS_5" : {
    Name : {DE : "BS1_KS1_MAS_oVS_SFS_v7", EN : "BS1_KS1_MAS_oVS_SFS_v7", FR : "BS1_KS1_MAS_oVS_SFS_v7", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "BS1_KS1_MAS_oVS_Zs380_SFS_5" : {
    Name : {DE : "BS1_KS1_MAS_oVS_Zs380_SFS_v7", EN : "BS1_KS1_MAS_oVS_Zs380_SFS_v7", FR : "BS1_KS1_MAS_oVS_Zs380_SFS_v7", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "BS1_KS1_MAS_SFS_5" : {
    Name : {DE : "BS1_KS1_MAS_SFS_v7", EN : "BS1_KS1_MAS_SFS_v7", FR : "BS1_KS1_MAS_SFS_v7", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "bs1_SH2_Scheibe" : {
    Name : {DE : "bs1_SH2_Scheibe", EN : "Ra BS1 SH2 disc", FR : "F_BS1_SH2_Scheibe", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Go", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Stop", FR : "Arrêt", },
  }},
  "DB_AM1_Signalschalter" : {
    Name : {DE : "DB_AM1_Signalschalter", EN : "Ra_DB_Signal_switch_AM1", FR : "F_Pilône caténaire", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "garagentor_sb2" : {
    Name : {DE : "Garagentor SB2", EN : "x_Garage door_SB2", FR : "x_Porte garage_SB2", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Open", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Close", FR : "Arrêt", },
  }},
  "H_Tafel_neu" : {
    Name : {DE : "H_Tafel_neu", EN : "Rd_New stop_sign", FR : "R_Arrêt poteau-H route nouveau", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Go", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Stop", FR : "Arrêt", },
  }},
  "H_Tafel30x_neu" : {
    Name : {DE : "H_Tafel30x_neu", EN : "Ra_Stop sign 30x_new", FR : "F_Arrêt poteau-H30x nouveau", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Go", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Stop", FR : "Arrêt", },
  }},
  "HP01_Form" : {
    Name : {DE : "HP01 Form", EN : "Ra_HP01_Semaphor_mast", FR : "F_HP-1bras avec présignal", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "HP01_Form_2fl_Vr0e" : {
    Name : {DE : "HP01 Form 2fl Vr0e", EN : "Ra_HP01_Semaphor_mast 2fl_Vr0e", FR : "F_HP-2bras _Vr0e", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "HP01_Form_oVSig" : {
    Name : {DE : "HP01 Form oVSig", EN : "Ra_HP01_Semaphor_no distant signal ", FR : "F_HP01 sans présignal", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "HP02_FORM" : {
    Name : {DE : "HP02 Form", EN : "Ra_HP02_Semaphor_mast", FR : "F_HP-2bras avec présignal", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "HpSig_A_V60_69_V8" : {
    Name : {DE : "HpSig_A_V60_69_V8", EN : "HpSig_A_V60_69_V8", FR : "HpSig_A_V60_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 60km/h", },
      4 : {DE : "Fahrt mit 40km/h", },
      5 : {DE : "Sh1 - Rangierfahrt", },
  }},
  "HpSig_A_V60_80_69_V8" : {
    Name : {DE : "HpSig_A_V60_80_69_V8", EN : "HpSig_A_V60_80_69_V8", FR : "HpSig_A_V60_80_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 80km/h", },
      4 : {DE : "Fahrt mit 60km/h", },
      5 : {DE : "Fahrt mit 40km/h", },
      6 : {DE : "Sh1 - Rangierfahrt", },
  }},
  "HpSig_A_V60_80_Vs_69_V8" : {
    Name : {DE : "HpSig_A_V60_80_Vs_69_V8", EN : "HpSig_A_V60_80_Vs_69_V8", FR : "HpSig_A_V60_80_Vs_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt mit 80km/h dann Halt", },
      5 : {DE : "Fahrt mit 80km/h dann Fahrt", },
      6 : {DE : "Fahrt mit 60km/h dann Halt", },
      7 : {DE : "Fahrt mit 60km/h dann Fahrt", },
      8 : {DE : "Fahrt mit 40km/h dann Halt", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      10 : {DE : "Sh1 - Rangierfahrt", },
  }},
  "HpSig_E_V60_80_Vs_69_V8" : {
    Name : {DE : "HpSig_E_V60_80_Vs_69_V8", EN : "HpSig_E_V60_80_Vs_69_V8", FR : "HpSig_E_V60_80_Vs_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann 40km/h", },
      5 : {DE : "Fahrt mit 80km/h dann Halt", },
      6 : {DE : "Fahrt mit 80km/h dann Fahrt", },
      7 : {DE : "Fahrt mit 80km/h dann 40km/h", },
      8 : {DE : "Fahrt mit 60km/h dann Halt", },
      9 : {DE : "Fahrt mit 60km/h dann Fahrt", },
      10 : {DE : "Fahrt mit 60km/h dann 40km/h", },
      11 : {DE : "Fahrt mit 40km/h dann Halt", },
      12 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      13 : {DE : "Fahrt mit 40km/h dann 40km/h", },
  }},
  "HpSig_E_V60_80_Vs_l_69_V8" : {
    Name : {DE : "HpSig_E_V60_80_Vs_l_69_V8", EN : "HpSig_E_V60_80_Vs_l_69_V8", FR : "HpSig_E_V60_80_Vs_l_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann 40km/h", },
      5 : {DE : "Fahrt mit 80km/h dann Halt", },
      6 : {DE : "Fahrt mit 80km/h dann Fahrt", },
      7 : {DE : "Fahrt mit 80km/h dann 40km/h", },
      8 : {DE : "Fahrt mit 60km/h dann Halt", },
      9 : {DE : "Fahrt mit 60km/h dann Fahrt", },
      10 : {DE : "Fahrt mit 60km/h dann 40km/h", },
      11 : {DE : "Fahrt mit 40km/h dann Halt", },
      12 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      13 : {DE : "Fahrt mit 40km/h dann 40km/h", },
  }},
  "HpSig_E_V80_Vs_69_V8" : {
    Name : {DE : "HpSig_E_V80_Vs_69_V8", EN : "HpSig_E_V80_Vs_69_V8", FR : "HpSig_E_V80_Vs_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann 40km/h", },
      5 : {DE : "Fahrt mit 80km/h dann Halt", },
      6 : {DE : "Fahrt mit 80km/h dann Fahrt", },
      7 : {DE : "Fahrt mit 80km/h dann 40km/h", },
      8 : {DE : "Fahrt mit 40km/h dann Halt", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      10 : {DE : "Fahrt mit 40km/h dann 40km/h", },
  }},
  "HpSig_E_V80_Vs_l_69_V8" : {
    Name : {DE : "HpSig_E_V80_Vs_l_69_V8", EN : "HpSig_E_V80_Vs_l_69_V8", FR : "HpSig_E_V80_Vs_l_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann 40km/h", },
      5 : {DE : "Fahrt mit 80km/h dann Halt", },
      6 : {DE : "Fahrt mit 80km/h dann Fahrt", },
      7 : {DE : "Fahrt mit 80km/h dann 40km/h", },
      8 : {DE : "Fahrt mit 40km/h dann Halt", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      10 : {DE : "Fahrt mit 40km/h dann 40km/h", },
  }},
  "HpSig_E_V100_Vs_V80_69_V8" : {
    Name : {DE : "HpSig_E_V100_Vs_V80_69_V8", EN : "HpSig_E_V100_Vs_V80_69_V8", FR : "HpSig_E_V100_Vs_V80_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann Fahrt mit 80km/h", },
      5 : {DE : "Fahrt dann Fahrt mit 40km/h", },
      6 : {DE : "Fahrt mit 100km/h dann Halt", },
      7 : {DE : "Fahrt mit 100km/h dann Fahrt", },
      8 : {DE : "Fahrt mit 100km/h dann Fahrt mit 80km/h", },
      9 : {DE : "Fahrt mit 100km/h dann Fahrt mit 40km/h", },
      10 : {DE : "Fahrt mit 40km/h dann Halt", },
      11 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      12 : {DE : "Fahrt mit 40km/h dann Fahrt mit 40km/h", },
  }},
  "HpSig_E_V100_Vs_V80_l_69_V8" : {
    Name : {DE : "HpSig_E_V100_Vs_V80_l_69_V8", EN : "HpSig_E_V100_Vs_V80_l_69_V8", FR : "HpSig_E_V100_Vs_V80_l_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann Fahrt mit 80km/h", },
      5 : {DE : "Fahrt dann Fahrt mit 40km/h", },
      6 : {DE : "Fahrt mit 100km/h dann Halt", },
      7 : {DE : "Fahrt mit 100km/h dann Fahrt", },
      8 : {DE : "Fahrt mit 100km/h dann Fahrt mit 80km/h", },
      9 : {DE : "Fahrt mit 100km/h dann Fahrt mit 40km/h", },
      10 : {DE : "Fahrt mit 40km/h dann Halt", },
      11 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      12 : {DE : "Fahrt mit 40km/h dann Fahrt mit 40km/h", },
  }},
  "KsSig_A_HSB" : {
    Name : {DE : "KsSig A HSB", EN : "Ra_KsSig_A_HSB", FR : "F_Ks_A_HSB", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "KsSig_E_HSB" : {
    Name : {DE : "KsSig E HSB", EN : "Ra_KsSig_E_HSB", FR : "F_Ks_E_HSB", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "SCHRANKE" : {
    Name : {DE : "Halbschranke (DR)", EN : "Rd Level crossing half barrier", FR : "R_PàN_feu+1/2 barr.droite avert.", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Open", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Close", FR : "Arrêt", },
  }},
  "SchrankeEPIII_IV" : {
    Name : {DE : "Schranke Ep.III-IV", EN : "Rd_Level Xing EPIII_IV", FR : "F_PàN EPIII_IV", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Open", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Close", FR : "Arrêt", },
  }},
  "StrabaSignal" : {
    Name : {DE : "Strab Signal2", EN : "Tr_Tram_Crossing signal", FR : "T_Feux carrefour", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Go", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Stop", FR : "Arrêt", },
  }},
  "HpSig_E_V60_80_Vs_69_V8" : {
    Name : {DE : "HpSig_E_V60_80_Vs_69_V8", EN : "HpSig_E_V60_80_Vs_69_V8", FR : "HpSig_E_V60_80_Vs_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann 40km/h", },
      5 : {DE : "Fahrt mit 80km/h dann Halt", },
      6 : {DE : "Fahrt mit 80km/h dann Fahrt", },
      7 : {DE : "Fahrt mit 80km/h dann 40km/h", },
      8 : {DE : "Fahrt mit 60km/h dann Halt", },
      9 : {DE : "Fahrt mit 60km/h dann Fahrt", },
      10 : {DE : "Fahrt mit 60km/h dann 40km/h", },
      11 : {DE : "Fahrt mit 40km/h dann Halt", },
      12 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      13 : {DE : "Fahrt mit 40km/h dann 40km/h", },
  }},
  "Signal_unsichtbar" : {
    Name : {DE : "Unsichtbares Signal", EN : "x_Invisible_Signal", FR : "x_Signal invisible", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Go", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Stop", FR : "Arrêt", },
  }},
  "Ampel_Licht_3" : {
    Name : {DE : "Ampel DE 3", EN : "Traffic signal light-Germany-3", FR : "Traffic signal lumineux-3", },
    Pos : {
      1 : {DE : "Fahrt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt", },
      4 : {DE : "Halt", },
  }},
  "Ampel_Licht_4" : {
    Name : {DE : "Ampel DE 4", EN : "Traffic signal light-Germany-4", FR : "Traffic signal lumineux-4", },
    Pos : {
      1 : {DE : "Fahrt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt", },
      4 : {DE : "Halt", },
  }},
  "Ampel_Licht_East_1" : {
    Name : {DE : "Ampel DE 1 Ost", EN : "Traffic signal light-East Germany-1", FR : "Traffic signal lumineux-Allemagne de l'Est-1", },
    Pos : {
      1 : {DE : "Fahrt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt", },
      4 : {DE : "Halt", },
  }},
  "Ampel_Licht_East_2" : {
    Name : {DE : "Ampel DE 2 Ost", EN : "Traffic signal light-East Germany-2", FR : "Traffic signal lumineux-Allemagne de l'Est-2", },
    Pos : {
      1 : {DE : "Fahrt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt", },
      4 : {DE : "Halt", },
  }},
  "Ampel_Licht_West_1" : {
    Name : {DE : "Ampel DE 1 West", EN : "Traffic signal light-Western Germany-1", FR : "Traffic signal lumineux-Allemagne de l'Ouest-1", },
    Pos : {
      1 : {DE : "Fahrt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt", },
      4 : {DE : "Halt", },
  }},
  "Ampel_Licht_West_2" : {
    Name : {DE : "Ampel DE 2 West", EN : "Traffic signal light-Western Germany-2", FR : "Traffic signal lumineux-Allemagne de l'Ouest-2", },
    Pos : {
      1 : {DE : "Fahrt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt", },
      4 : {DE : "Halt", },
  }},
  "BUA_90_An_T_EpV" : {
    Name : {DE : "BUA 90 An T EpV", EN : "Rd_Level Xing_90_An_T_EpV", FR : "R_PàN-El_feux 2côtés sans barr.", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Open", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Close", FR : "Arrêt", },
  }},
  "BUE_Beh_h90Li_EpV" : {
    Name : {DE : "BUE Beh h90Li EpV", EN : "Rd_Level Xing Beh_h90Li_EpV", FR : "R_PàN_feu+1/2 barr. gauche", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Open", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Close", FR : "Arrêt", },
  }},
  "BUE_Beh_h90Li_T_EpV" : {
    Name : {DE : "BUE Beh h90Li T EpV", EN : "Rd_Level Xing Beh_h90Li_T_EpV", FR : "R_PàN-El_feu+1/2 barr. gauche", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Open", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Close", FR : "Arrêt", },
  }},
  "BUE_Beh_h90Re_EpV" : {
    Name : {DE : "BUE Beh h90Re EpV", EN : "Rd_Level Xing Beh_h90Re_EpV", FR : "R_PàN_feu+1/2 barr. droite", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Open", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Close", FR : "Arrêt", },
  }},
  "BUE_Beh_h90Re_T_EpV" : {
    Name : {DE : "BUE Beh h90Re T EpV", EN : "Rd_Level Xing Beh_h90Re_T_EpV", FR : "R_PàN-El_feu+1/2 barr. droite", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Open", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Close", FR : "Arrêt", },
  }},
  "BUE_h90_Xx_EpV" : {
    Name : {DE : "BUE h90 Xx EpV", EN : "Rd_Level Xing h90_Xx_EpV", FR : "R_PàN_1/2 barr. droite sans feu", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Open", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Close", FR : "Arrêt", },
  }},
  "BUE_v90_A_T_EpV" : {
    Name : {DE : "BUE v90 A T EpV", EN : "Rd_Level Xing_v90_A_T_EpV", FR : "R_PàN_feux 2 côtés grande barrière", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Open", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Close", FR : "Arrêt", },
  }},
  "DKW-Signal_Alt" : {
    Name : {DE : "DKW-Signal_Alt", EN : "DKW-Signal_Alt", FR : "DKW-Signal_Alt", },
    Pos : {
      1 : {DE : "Links - Rechts", EN : "Left - Right", },
      2 : {DE : "Links - Links", EN : "Left - Left", },
      3 : {DE : "Rechts - Links", EN : "Right - Left", },
      4 : {DE : "Rechts - Rechts", EN : "Right - Right", },
  }},
  "Dummy" : {
    Name : {DE : "Dummy (unsichtbar)", EN : "x_Dummy", FR : "x_Factice", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Open", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Close", FR : "Arrêt", },
  }},
  "H_Bus" : {
    Name : {DE : "H_Bus", EN : "Rd_Bus stop", FR : "R_Arrét bus trottoir", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Go", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Stop", FR : "Arrêt", },
  }},
  "H_Tafel" : {
    Name : {DE : "H_Tafel", EN : "Rd_Old stop sign", FR : "R_Arrêt poteau-H route ancien", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Go", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Stop", FR : "Arrêt", },
  }},
  "H_Tafel_So9" : {
    Name : {DE : "H_Tafel_So9", EN : "Ra_Stop_sign_So9", FR : "F_Arrêt poteau-H S09", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Go", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Stop", FR : "Arrêt", },
  }},
  "H_Tafel30x" : {
    Name : {DE : "H_Tafel30x", EN : "Ra_Stop sign 30x", FR : "H_Tafel30x", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Go", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Stop", FR : "Arrêt", },
  }},
  "HlSig_A_Vmax" : {
    Name : {DE : "HlSig A Vmax", EN : "Ra_HlSig_A_Vmax", FR : "F_Hl_Vmax_sans présignal", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "HlSig_B" : {
    Name : {DE : "HlSig B", EN : "Ra_HlSig_B", FR : "F_Hl_avec présignal", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "HlSig_E_Vhalt" : {
    Name : {DE : "HlSig E Vhalt", EN : "Ra_HlSig_E_Vhalt", FR : "F_Hl_Vhalt_avec présignal", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "HP01_Form_A_Harz" : {
    Name : {DE : "HP01 Form A Harz", EN : "Ra_HP01_Semaphor_mast_A_Harz", FR : "F_HP-1bras sans présignal", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "HP01_Form_E_Harz" : {
    Name : {DE : "HP01 Form E Harz", EN : "Ra_HP01_Semaphor_mast_E_Harz", FR : "F_HP-1bras-EL sans présignal", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "HpSig_A_V40_69_V7" : {
    Name : {DE : "HpSig_A_V40_69_V7", EN : "HpSig_A_V40_69_V7", FR : "HpSig_A_V40_69_V7", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 40km/h", },
      4 : {DE : "Sh1 - Rangierfahrt", },
  }},
  "HpSig_A_V40_EpIV" : {
    Name : {DE : "HpSig A V40 EpIV", EN : "Ra_HpSig_A_V40_EpIV", FR : "F_HpSig_A_V40_EpIV", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "HpSig_A_V40_Vr0_EpIV" : {
    Name : {DE : "HpSig A V40 Vr0 EpIV", EN : "Ra_HpSig_A_V40_Vr0_EpIV", FR : "F_HpSig_A_V40_Vr0_EpIV", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "HpSig_A_V40_Vs_69_V7" : {
    Name : {DE : "HpSig_A_V40_Vs_69_V7", EN : "HpSig_A_V40_Vs_69_V7", FR : "HpSig_A_V40_Vs_69_V7", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt - Halt erwarten", },
      3 : {DE : "Fahrt - Fahrt erwarten", },
      4 : {DE : "Fahrt mit 40km/h - Halt erwarten", },
      5 : {DE : "Fahrt mit 40km/h - Fahrt erwarten", },
      6 : {DE : "Sh1 - Rangierfahrt", },
  }},
  "HpSig_A_V60_69_V8" : {
    Name : {DE : "HpSig_A_V60_69_V8", EN : "HpSig_A_V60_69_V8", FR : "HpSig_A_V60_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 60km/h", },
      4 : {DE : "Fahrt mit 40km/h", },
      5 : {DE : "Sh1 - Rangierfahrt", },
  }},
  "HpSig_A_V60_80_69_V8" : {
    Name : {DE : "HpSig_A_V60_80_69_V8", EN : "HpSig_A_V60_80_69_V8", FR : "HpSig_A_V60_80_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 80km/h", },
      4 : {DE : "Fahrt mit 60km/h", },
      5 : {DE : "Fahrt mit 40km/h", },
      6 : {DE : "Sh1 - Rangierfahrt", },
  }},
  "HpSig_A_V60_80_Vs_69_V8" : {
    Name : {DE : "HpSig_A_V60_80_Vs_69_V8", EN : "HpSig_A_V60_80_Vs_69_V8", FR : "HpSig_A_V60_80_Vs_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt mit 80km/h dann Halt", },
      5 : {DE : "Fahrt mit 80km/h dann Fahrt", },
      6 : {DE : "Fahrt mit 60km/h dann Halt", },
      7 : {DE : "Fahrt mit 60km/h dann Fahrt", },
      8 : {DE : "Fahrt mit 40km/h dann Halt", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      10 : {DE : "Sh1 - Rangierfahrt", },
  }},
  "HpSig_A_V60_Vs_69_V8" : {
    Name : {DE : "HpSig_A_V60_Vs_69_V8", EN : "HpSig_A_V60_Vs_69_V8", FR : "HpSig_A_V60_Vs_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt mit 60km/h dann Halt", },
      5 : {DE : "Fahrt mit 60km/h dann Fahrt", },
      6 : {DE : "Fahrt mit 40km/h dann Halt", },
      7 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      8 : {DE : "Sh1 - Rangierfahrt", },
  }},
  "HpSig_A_V80_69_V8" : {
    Name : {DE : "HpSig_A_V80_69_V8", EN : "HpSig_A_V80_69_V8", FR : "HpSig_A_V80_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 80km/h", },
      4 : {DE : "Fahrt mit 40km/h", },
      5 : {DE : "Sh1 - Rangierfahrt", },
  }},
  "HpSig_A_V80_Vs_69_V8" : {
    Name : {DE : "HpSig_A_V80_Vs_69_V8", EN : "HpSig_A_V80_Vs_69_V8", FR : "HpSig_A_V80_Vs_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt mit 80km/h dann Halt", },
      5 : {DE : "Fahrt mit 80km/h dann Fahrt", },
      6 : {DE : "Fahrt mit 40km/h dann Halt", },
      7 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      8 : {DE : "Sh1 - Rangierfahrt", },
  }},
  "HpSig_A_V100_69_V8" : {
    Name : {DE : "HpSig_A_V100_69_V8", EN : "HpSig_A_V100_69_V8", FR : "HpSig_A_V100_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 100km/h", },
      4 : {DE : "Fahrt mit 40km/h", },
      5 : {DE : "Sh1 - Rangierfahrt", },
  }},
  "HpSig_A_V100_Vs_69_V8" : {
    Name : {DE : "HpSig_A_V100_Vs_69_V8", EN : "HpSig_A_V100_Vs_69_V8", FR : "HpSig_A_V100_Vs_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt mit 100km/h dann Halt", },
      5 : {DE : "Fahrt mit 100km/h dann Fahrt", },
      6 : {DE : "Fahrt mit 40km/h dann Halt", },
      7 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      8 : {DE : "Sh1 - Rangierfahrt", },
  }},
  "HpSig_A_Vmax_69_V7" : {
    Name : {DE : "HpSig_A_Vmax_69_V7", EN : "HpSig_A_Vmax_69_V7", FR : "HpSig_A_Vmax_69_V7", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Sh1 - Rangierfahrt", },
  }},
  "HpSig_A_Vmax_EpIII" : {
    Name : {DE : "HpSig A Vmax EpIII", EN : "Ra_HpSig_A_Vmax_EpIII", FR : "F_Hp_A_Vmax_EpIII", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "HpSig_A_Vmax_EpIV" : {
    Name : {DE : "HpSig A Vmax EpIV", EN : "Ra_HpSig_A_Vmax_EpIV", FR : "F_Hp_A_Vmax_EpIV", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "HpSig_A_Vmax_Vr0_EpIV" : {
    Name : {DE : "HpSig A Vmax Vr0 EpIV", EN : "Ra_HpSig_A_Vmax_Vr0_EpIV", FR : "F_HpSig_A_Vmax_Vr0_EpIV", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "HpSig_A_Vmax_Vs_69_V7" : {
    Name : {DE : "HpSig_A_Vmax_Vs_69_V7", EN : "HpSig_A_Vmax_Vs_69_V7", FR : "HpSig_A_Vmax_Vs_69_V7", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt - Halt erwarten", },
      3 : {DE : "Fahrt - Fahrt erwarten", },
      4 : {DE : "Sh1 - Rangierfahrt", },
  }},
  "HpSig_Ae_V80_69_V8" : {
    Name : {DE : "HpSig_Ae_V80_69_V8", EN : "HpSig_Ae_V80_69_V8", FR : "HpSig_Ae_V80_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 80km/h", },
      4 : {DE : "Sh1 - Rangierfahrt", },
  }},
  "HpSig_Ae_V80_Vs_69_V8" : {
    Name : {DE : "HpSig_Ae_V80_Vs_69_V8", EN : "HpSig_Ae_V80_Vs_69_V8", FR : "HpSig_Ae_V80_Vs_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt mit 80km/h dann Halt", },
      5 : {DE : "Fahrt mit 80km/h dann Fahrt", },
      6 : {DE : "Sh1 - Rangierfahrt", },
  }},
  "HpSig_Ae_V100_69_V8" : {
    Name : {DE : "HpSig_Ae_V100_69_V8", EN : "HpSig_Ae_V100_69_V8", FR : "HpSig_Ae_V100_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 100km/h", },
      4 : {DE : "Sh1 - Rangierfahrt", },
  }},
  "HpSig_Ae_V100_Vs_69_V8" : {
    Name : {DE : "HpSig_Ae_V100_Vs_69_V8", EN : "HpSig_Ae_V100_Vs_69_V8", FR : "HpSig_Ae_V100_Vs_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt mit 100km/h dann Halt", },
      5 : {DE : "Fahrt mit 100km/h dann Fahrt", },
      6 : {DE : "Sh1 - Rangierfahrt", },
  }},
  "HpSig_Ae_V120_69_V8" : {
    Name : {DE : "HpSig_Ae_V120_69_V8", EN : "HpSig_Ae_V120_69_V8", FR : "HpSig_Ae_V120_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 120km/h", },
      4 : {DE : "Sh1 - Rangierfahrt", },
  }},
  "HpSig_AZ_V40_Vs_69_V7" : {
    Name : {DE : "HpSig_AZ_V40_Vs_69_V7", EN : "HpSig_AZ_V40_Vs_69_V7", FR : "HpSig_AZ_V40_Vs_69_V7", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt - Halt erwarten", },
      3 : {DE : "Fahrt - Fahrt erwarten", },
      4 : {DE : "Fahrt - Fahrt mit 40km/h erwarten", },
      5 : {DE : "Fahrt mit 40km/h - Halt erwarten", },
      6 : {DE : "Fahrt mit 40km/h - Fahrt erwarten", },
      7 : {DE : "Fahrt mit 40km/h - Fahrt mit 40km/h erwarten", },
      8 : {DE : "Sh1 - Rangierfahrt", },
  }},
  "HpSig_AZ_Vmax_Vs_69_V7" : {
    Name : {DE : "HpSig_AZ_Vmax_Vs_69_V7", EN : "HpSig_AZ_Vmax_Vs_69_V7", FR : "HpSig_AZ_Vmax_Vs_69_V7", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt - Halt erwarten", },
      3 : {DE : "Fahrt - Fahrt erwarten", },
      4 : {DE : "Fahrt - Fahrt mit 40km/h erwarten", },
      5 : {DE : "Sh1 - Rangierfahrt", },
  }},
  "HpSig_B_69_V7" : {
    Name : {DE : "HpSig_B_69_V7", EN : "HpSig_B_69_V7", FR : "HpSig_B_69_V7", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
  }},
  "HpSig_B_EpIII" : {
    Name : {DE : "HpSig B EpIII", EN : "Ra_HpSig_B_EpIII", FR : "F_Hp_B_EpIII", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "HpSig_B_EpIV" : {
    Name : {DE : "HpSig B EpIV", EN : "Ra_HpSig_B_EpIV", FR : "F_Hp_B_EpIV", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "HpSig_B_EpIV_L" : {
    Name : {DE : "HpSig B EpIV L", EN : "Ra_HpSig_B_EpIV_L", FR : "F_HpSig_B_EpIV_L", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "HpSig_B_oVSig_69_V7" : {
    Name : {DE : "HpSig_B_oVSig_69_V7", EN : "HpSig_B_oVSig_69_V7", FR : "HpSig_B_oVSig_69_V7", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
  }},
  "HpSig_B_Vswg_69_V7" : {
    Name : {DE : "HpSig_B_Vswg_69_V7", EN : "HpSig_B_Vswg_69_V7", FR : "HpSig_B_Vswg_69_V7", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt - Halt erwarten", },
      3 : {DE : "Fahrt - Fahrt erwarten", },
  }},
  "HpSig_B_Vswg_oVSig_69_V7" : {
    Name : {DE : "HpSig_B_Vswg_oVSig_69_V7", EN : "HpSig_B_Vswg_oVSig_69_V7", FR : "HpSig_B_Vswg_oVSig_69_V7", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt - Halt erwarten", },
      3 : {DE : "Fahrt - Fahrt erwarten", },
  }},
  "HpSig_B_Vswr_69_V7" : {
    Name : {DE : "HpSig_B_Vswr_69_V7", EN : "HpSig_B_Vswr_69_V7", FR : "HpSig_B_Vswr_69_V7", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt - Halt erwarten", },
      3 : {DE : "Fahrt - Fahrt erwarten", },
  }},
  "HpSig_B_Vswr_oVSig_69_V7" : {
    Name : {DE : "HpSig_B_Vswr_oVSig_69_V7", EN : "HpSig_B_Vswr_oVSig_69_V7", FR : "HpSig_B_Vswr_oVSig_69_V7", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt - Halt erwarten", },
      3 : {DE : "Fahrt - Fahrt erwarten", },
  }},
  "HpSig_E_V20_30_69_V8" : {
    Name : {DE : "HpSig_E_V20_30_69_V8", EN : "HpSig_E_V20_30_69_V8", FR : "HpSig_E_V20_30_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 40km/h", },
      4 : {DE : "Fahrt mit 30km/h", },
      5 : {DE : "Fahrt mit 20km/h", },
  }},
  "HpSig_E_V20_30_l_69_V8" : {
    Name : {DE : "HpSig_E_V20_30_l_69_V8", EN : "HpSig_E_V20_30_l_69_V8", FR : "HpSig_E_V20_30_l_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 40km/h", },
      4 : {DE : "Fahrt mit 30km/h", },
      5 : {DE : "Fahrt mit 20km/h", },
  }},
  "HpSig_E_V20_69_V8" : {
    Name : {DE : "HpSig_E_V20_69_V8", EN : "HpSig_E_V20_69_V8", FR : "HpSig_E_V20_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 40km/h", },
      4 : {DE : "Fahrt mit 20km/h", },
  }},
  "HpSig_E_V20_l_69_V8" : {
    Name : {DE : "HpSig_E_V20_l_69_V8", EN : "HpSig_E_V20_l_69_V8", FR : "HpSig_E_V20_l_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 40km/h", },
      4 : {DE : "Fahrt mit 20km/h", },
  }},
  "HpSig_E_V30_69_V8" : {
    Name : {DE : "HpSig_E_V30_69_V8", EN : "HpSig_E_V30_69_V8", FR : "HpSig_E_V30_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 40km/h", },
      4 : {DE : "Fahrt mit 30km/h", },
  }},
  "HpSig_E_V30_l_69_V8" : {
    Name : {DE : "HpSig_E_V30_l_69_V8", EN : "HpSig_E_V30_l_69_V8", FR : "HpSig_E_V30_l_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 40km/h", },
      4 : {DE : "Fahrt mit 30km/h", },
  }},
  "HpSig_E_V40_69_V7" : {
    Name : {DE : "HpSig_E_V40_69_V7", EN : "HpSig_E_V40_69_V7", FR : "HpSig_E_V40_69_V7", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 40km/h", },
  }},
  "HpSig_E_V40_l_69_V7" : {
    Name : {DE : "HpSig_E_V40_l_69_V7", EN : "HpSig_E_V40_l_69_V7", FR : "HpSig_E_V40_l_69_V7", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 40km/h", },
  }},
  "HpSig_E_V40_Vr0_EpIV" : {
    Name : {DE : "HpSig E V40 Vr0 EpIV", EN : "Ra_HpSig_E_V40_Vr0_EpIV", FR : "F_HpSig_E_V40_Vr0_EpIV", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "HpSig_E_V40_Vs_69_V7" : {
    Name : {DE : "HpSig_E_V40_Vs_69_V7", EN : "HpSig_E_V40_Vs_69_V7", FR : "HpSig_E_V40_Vs_69_V7", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt - Halt erwarten", },
      3 : {DE : "Fahrt - Fahrt erwarten", },
      4 : {DE : "Fahrt - Fahrt mit 40km/h erwarten", },
      5 : {DE : "Fahrt mit 40km/h - Halt erwarten", },
      6 : {DE : "Fahrt mit 40km/h - Fahrt erwarten", },
      7 : {DE : "Fahrt mit 40km/h - Fahrt mit 40km/h erwarten", },
  }},
  "HpSig_E_V40_Vs_l_69_V7" : {
    Name : {DE : "HpSig_E_V40_Vs_l_69_V7", EN : "HpSig_E_V40_Vs_l_69_V7", FR : "HpSig_E_V40_Vs_l_69_V7", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt - Halt erwarten", },
      3 : {DE : "Fahrt - Fahrt erwarten", },
      4 : {DE : "Fahrt - Fahrt mit 40km/h erwarten", },
      5 : {DE : "Fahrt mit 40km/h - Halt erwarten", },
      6 : {DE : "Fahrt mit 40km/h - Fahrt erwarten", },
      7 : {DE : "Fahrt mit 40km/h - Fahrt mit 40km/h erwarten", },
  }},
  "HpSig_E_V40_Vs_V20_30_69_V8" : {
    Name : {DE : "HpSig_E_V40_Vs_V20_30_69_V8", EN : "HpSig_E_V40_Vs_V20_30_69_V8", FR : "HpSig_E_V40_Vs_V20_30_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann Fahrt mit 40km/h", },
      5 : {DE : "Fahrt dann Fahrt mit 30km/h", },
      6 : {DE : "Fahrt dann Fahrt mit 20km/h", },
      7 : {DE : "Fahrt mit 40km/h dann Halt", },
      8 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt mit 40km/h", },
      10 : {DE : "Fahrt mit 40km/h dann Fahrt mit 30km/h", },
      11 : {DE : "Fahrt mit 40km/h dann Fahrt mit 20km/h", },
  }},
  "HpSig_E_V40_Vs_V20_30_l_69_V8" : {
    Name : {DE : "HpSig_E_V40_Vs_V20_30_l_69_V8", EN : "HpSig_E_V40_Vs_V20_30_l_69_V8", FR : "HpSig_E_V40_Vs_V20_30_l_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann Fahrt mit 40km/h", },
      5 : {DE : "Fahrt dann Fahrt mit 30km/h", },
      6 : {DE : "Fahrt dann Fahrt mit 20km/h", },
      7 : {DE : "Fahrt mit 40km/h dann Halt", },
      8 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt mit 40km/h", },
      10 : {DE : "Fahrt mit 40km/h dann Fahrt mit 30km/h", },
      11 : {DE : "Fahrt mit 40km/h dann Fahrt mit 20km/h", },
  }},
  "HpSig_E_V40_Vs_V20_69_V8" : {
    Name : {DE : "HpSig_E_V40_Vs_V20_69_V8", EN : "HpSig_E_V40_Vs_V20_69_V8", FR : "HpSig_E_V40_Vs_V20_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann Fahrt mit 40km/h", },
      5 : {DE : "Fahrt dann Fahrt mit 20km/h", },
      6 : {DE : "Fahrt mit 40km/h dann Halt", },
      7 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      8 : {DE : "Fahrt mit 40km/h dann Fahrt mit 40km/h", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt mit 20km/h", },
  }},
  "HpSig_E_V40_Vs_V20_l_69_V8" : {
    Name : {DE : "HpSig_E_V40_Vs_V20_l_69_V8", EN : "HpSig_E_V40_Vs_V20_l_69_V8", FR : "HpSig_E_V40_Vs_V20_l_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann Fahrt mit 40km/h", },
      5 : {DE : "Fahrt dann Fahrt mit 20km/h", },
      6 : {DE : "Fahrt mit 40km/h dann Halt", },
      7 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      8 : {DE : "Fahrt mit 40km/h dann Fahrt mit 40km/h", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt mit 20km/h", },
  }},
  "HpSig_E_V40_Vs_V30_69_V8" : {
    Name : {DE : "HpSig_E_V40_Vs_V30_69_V8", EN : "HpSig_E_V40_Vs_V30_69_V8", FR : "HpSig_E_V40_Vs_V30_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann Fahrt mit 40km/h", },
      5 : {DE : "Fahrt dann Fahrt mit 30km/h", },
      6 : {DE : "Fahrt mit 40km/h dann Halt", },
      7 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      8 : {DE : "Fahrt mit 40km/h dann Fahrt mit 40km/h", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt mit 30km/h", },
  }},
  "HpSig_E_V40_Vs_V30_l_69_V8" : {
    Name : {DE : "HpSig_E_V40_Vs_V30_l_69_V8", EN : "HpSig_E_V40_Vs_V30_l_69_V8", FR : "HpSig_E_V40_Vs_V30_l_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann Fahrt mit 40km/h", },
      5 : {DE : "Fahrt dann Fahrt mit 30km/h", },
      6 : {DE : "Fahrt mit 40km/h dann Halt", },
      7 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      8 : {DE : "Fahrt mit 40km/h dann Fahrt mit 40km/h", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt mit 30km/h", },
  }},
  "HpSig_E_V40_Vs_V60_69_V8" : {
    Name : {DE : "HpSig_E_V40_Vs_V60_69_V8", EN : "HpSig_E_V40_Vs_V60_69_V8", FR : "HpSig_E_V40_Vs_V60_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann Fahrt mit 60km/h", },
      5 : {DE : "Fahrt dann Fahrt mit 40km/h", },
      6 : {DE : "Fahrt mit 40km/h dann Halt", },
      7 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      8 : {DE : "Fahrt mit 40km/h dann Fahrt mit 60km/h", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt mit 40km/h", },
  }},
  "HpSig_E_V40_Vs_V60_80_69_V8" : {
    Name : {DE : "HpSig_E_V40_Vs_V60_80_69_V8", EN : "HpSig_E_V40_Vs_V60_80_69_V8", FR : "HpSig_E_V40_Vs_V60_80_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann Fahrt mit 80km/h", },
      5 : {DE : "Fahrt dann Fahrt mit 60km/h", },
      6 : {DE : "Fahrt dann Fahrt mit 40km/h", },
      7 : {DE : "Fahrt mit 40km/h dann Halt", },
      8 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt mit 80km/h", },
      10 : {DE : "Fahrt mit 40km/h dann Fahrt mit 60km/h", },
      11 : {DE : "Fahrt mit 40km/h dann Fahrt mit 40km/h", },
  }},
  "HpSig_E_V40_Vs_V60_80_l_69_V8" : {
    Name : {DE : "HpSig_E_V40_Vs_V60_80_l_69_V8", EN : "HpSig_E_V40_Vs_V60_80_l_69_V8", FR : "HpSig_E_V40_Vs_V60_80_l_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann Fahrt mit 80km/h", },
      5 : {DE : "Fahrt dann Fahrt mit 60km/h", },
      6 : {DE : "Fahrt dann Fahrt mit 40km/h", },
      7 : {DE : "Fahrt mit 40km/h dann Halt", },
      8 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt mit 80km/h", },
      10 : {DE : "Fahrt mit 40km/h dann Fahrt mit 60km/h", },
      11 : {DE : "Fahrt mit 40km/h dann Fahrt mit 40km/h", },
  }},
  "HpSig_E_V40_Vs_V60_l_69_V8" : {
    Name : {DE : "HpSig_E_V40_Vs_V60_l_69_V8", EN : "HpSig_E_V40_Vs_V60_l_69_V8", FR : "HpSig_E_V40_Vs_V60_l_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann Fahrt mit 60km/h", },
      5 : {DE : "Fahrt dann Fahrt mit 40km/h", },
      6 : {DE : "Fahrt mit 40km/h dann Halt", },
      7 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      8 : {DE : "Fahrt mit 40km/h dann Fahrt mit 60km/h", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt mit 40km/h", },
  }},
  "HpSig_E_V40_Vs_V80_69_V8" : {
    Name : {DE : "HpSig_E_V40_Vs_V80_69_V8", EN : "HpSig_E_V40_Vs_V80_69_V8", FR : "HpSig_E_V40_Vs_V80_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann Fahrt mit 80km/h", },
      5 : {DE : "Fahrt dann Fahrt mit 40km/h", },
      6 : {DE : "Fahrt mit 40km/h dann Halt", },
      7 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      8 : {DE : "Fahrt mit 40km/h dann Fahrt mit 80km/h", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt mit 40km/h", },
  }},
  "HpSig_E_V40_Vs_V80_l_69_V8" : {
    Name : {DE : "HpSig_E_V40_Vs_V80_l_69_V8", EN : "HpSig_E_V40_Vs_V80_l_69_V8", FR : "HpSig_E_V40_Vs_V80_l_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann Fahrt mit 80km/h", },
      5 : {DE : "Fahrt dann Fahrt mit 40km/h", },
      6 : {DE : "Fahrt mit 40km/h dann Halt", },
      7 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      8 : {DE : "Fahrt mit 40km/h dann Fahrt mit 80km/h", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt mit 40km/h", },
  }},
  "HpSig_E_V40_Vs_V100_69_V8" : {
    Name : {DE : "HpSig_E_V40_Vs_V100_69_V8", EN : "HpSig_E_V40_Vs_V100_69_V8", FR : "HpSig_E_V40_Vs_V100_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann Fahrt mit 100km/h", },
      5 : {DE : "Fahrt dann Fahrt mit 40km/h", },
      6 : {DE : "Fahrt mit 40km/h dann Halt", },
      7 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      8 : {DE : "Fahrt mit 40km/h dann Fahrt mit 100km/h", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt mit 40km/h", },
  }},
  "HpSig_E_V40_Vs_V100_l_69_V8" : {
    Name : {DE : "HpSig_E_V40_Vs_V100_l_69_V8", EN : "HpSig_E_V40_Vs_V100_l_69_V8", FR : "HpSig_E_V40_Vs_V100_l_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann Fahrt mit 100km/h", },
      5 : {DE : "Fahrt dann Fahrt mit 40km/h", },
      6 : {DE : "Fahrt mit 40km/h dann Halt", },
      7 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      8 : {DE : "Fahrt mit 40km/h dann Fahrt mit 100km/h", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt mit 40km/h", },
  }},
  "HpSig_E_V60_69_V8" : {
    Name : {DE : "HpSig_E_V60_69_V8", EN : "HpSig_E_V60_69_V8", FR : "HpSig_E_V60_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 60km/h", },
      4 : {DE : "Fahrt mit 40km/h", },
  }},
  "HpSig_E_V60_80_69_V8" : {
    Name : {DE : "HpSig_E_V60_80_69_V8", EN : "HpSig_E_V60_80_69_V8", FR : "HpSig_E_V60_80_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 80km/h", },
      4 : {DE : "Fahrt mit 60km/h", },
      5 : {DE : "Fahrt mit 40km/h", },
  }},
  "HpSig_E_V60_80_l_69_V8" : {
    Name : {DE : "HpSig_E_V60_80_l_69_V8", EN : "HpSig_E_V60_80_l_69_V8", FR : "HpSig_E_V60_80_l_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 80km/h", },
      4 : {DE : "Fahrt mit 60km/h", },
      5 : {DE : "Fahrt mit 40km/h", },
  }},
  "HpSig_E_V60_80_Vs_69_V8" : {
    Name : {DE : "HpSig_E_V60_80_Vs_69_V8", EN : "HpSig_E_V60_80_Vs_69_V8", FR : "HpSig_E_V60_80_Vs_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann 40km/h", },
      5 : {DE : "Fahrt mit 80km/h dann Halt", },
      6 : {DE : "Fahrt mit 80km/h dann Fahrt", },
      7 : {DE : "Fahrt mit 80km/h dann 40km/h", },
      8 : {DE : "Fahrt mit 60km/h dann Halt", },
      9 : {DE : "Fahrt mit 60km/h dann Fahrt", },
      10 : {DE : "Fahrt mit 60km/h dann 40km/h", },
      11 : {DE : "Fahrt mit 40km/h dann Halt", },
      12 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      13 : {DE : "Fahrt mit 40km/h dann 40km/h", },
  }},
  "HpSig_E_V60_80_Vs_l_69_V8" : {
    Name : {DE : "HpSig_E_V60_80_Vs_l_69_V8", EN : "HpSig_E_V60_80_Vs_l_69_V8", FR : "HpSig_E_V60_80_Vs_l_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann 40km/h", },
      5 : {DE : "Fahrt mit 80km/h dann Halt", },
      6 : {DE : "Fahrt mit 80km/h dann Fahrt", },
      7 : {DE : "Fahrt mit 80km/h dann 40km/h", },
      8 : {DE : "Fahrt mit 60km/h dann Halt", },
      9 : {DE : "Fahrt mit 60km/h dann Fahrt", },
      10 : {DE : "Fahrt mit 60km/h dann 40km/h", },
      11 : {DE : "Fahrt mit 40km/h dann Halt", },
      12 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      13 : {DE : "Fahrt mit 40km/h dann 40km/h", },
  }},
  "HpSig_E_V60_l_69_V8" : {
    Name : {DE : "HpSig_E_V60_l_69_V8", EN : "HpSig_E_V60_l_69_V8", FR : "HpSig_E_V60_l_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 60km/h", },
      4 : {DE : "Fahrt mit 40km/h", },
  }},
  "HpSig_E_V60_Vs_69_V8" : {
    Name : {DE : "HpSig_E_V60_Vs_69_V8", EN : "HpSig_E_V60_Vs_69_V8", FR : "HpSig_E_V60_Vs_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann 40km/h", },
      5 : {DE : "Fahrt mit 60km/h dann Halt", },
      6 : {DE : "Fahrt mit 60km/h dann Fahrt", },
      7 : {DE : "Fahrt mit 60km/h dann 40km/h", },
      8 : {DE : "Fahrt mit 40km/h dann Halt", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      10 : {DE : "Fahrt mit 40km/h dann 40km/h", },
  }},
  "HpSig_E_V60_Vs_l_69_V8" : {
    Name : {DE : "HpSig_E_V60_Vs_l_69_V8", EN : "HpSig_E_V60_Vs_l_69_V8", FR : "HpSig_E_V60_Vs_l_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann 40km/h", },
      5 : {DE : "Fahrt mit 60km/h dann Halt", },
      6 : {DE : "Fahrt mit 60km/h dann Fahrt", },
      7 : {DE : "Fahrt mit 60km/h dann 40km/h", },
      8 : {DE : "Fahrt mit 40km/h dann Halt", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      10 : {DE : "Fahrt mit 40km/h dann 40km/h", },
  }},
  "HpSig_E_V80_69_V8" : {
    Name : {DE : "HpSig_E_V80_69_V8", EN : "HpSig_E_V80_69_V8", FR : "HpSig_E_V80_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 80km/h", },
      4 : {DE : "Fahrt mit 40km/h", },
  }},
  "HpSig_E_V80_l_69_V8" : {
    Name : {DE : "HpSig_E_V80_l_69_V8", EN : "HpSig_E_V80_l_69_V8", FR : "HpSig_E_V80_l_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 80km/h", },
      4 : {DE : "Fahrt mit 40km/h", },
  }},
  "HpSig_E_V80_Vs_69_V8" : {
    Name : {DE : "HpSig_E_V80_Vs_69_V8", EN : "HpSig_E_V80_Vs_69_V8", FR : "HpSig_E_V80_Vs_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann 40km/h", },
      5 : {DE : "Fahrt mit 80km/h dann Halt", },
      6 : {DE : "Fahrt mit 80km/h dann Fahrt", },
      7 : {DE : "Fahrt mit 80km/h dann 40km/h", },
      8 : {DE : "Fahrt mit 40km/h dann Halt", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      10 : {DE : "Fahrt mit 40km/h dann 40km/h", },
  }},
  "HpSig_E_V80_Vs_l_69_V8" : {
    Name : {DE : "HpSig_E_V80_Vs_l_69_V8", EN : "HpSig_E_V80_Vs_l_69_V8", FR : "HpSig_E_V80_Vs_l_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann 40km/h", },
      5 : {DE : "Fahrt mit 80km/h dann Halt", },
      6 : {DE : "Fahrt mit 80km/h dann Fahrt", },
      7 : {DE : "Fahrt mit 80km/h dann 40km/h", },
      8 : {DE : "Fahrt mit 40km/h dann Halt", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      10 : {DE : "Fahrt mit 40km/h dann 40km/h", },
  }},
  "HpSig_E_V100_69_V8" : {
    Name : {DE : "HpSig_E_V100_69_V8", EN : "HpSig_E_V100_69_V8", FR : "HpSig_E_V100_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 100km/h", },
      4 : {DE : "Fahrt mit 40km/h", },
  }},
  "HpSig_E_V100_l_69_V8" : {
    Name : {DE : "HpSig_E_V100_l_69_V8", EN : "HpSig_E_V100_l_69_V8", FR : "HpSig_E_V100_l_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt", },
      3 : {DE : "Fahrt mit 100km/h", },
      4 : {DE : "Fahrt mit 40km/h", },
  }},
  "HpSig_E_V100_Vs_69_V8" : {
    Name : {DE : "HpSig_E_V100_Vs_69_V8", EN : "HpSig_E_V100_Vs_69_V8", FR : "HpSig_E_V100_Vs_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann 40km/h", },
      5 : {DE : "Fahrt mit 100km/h dann Halt", },
      6 : {DE : "Fahrt mit 100km/h dann Fahrt", },
      7 : {DE : "Fahrt mit 100km/h dann 40km/h", },
      8 : {DE : "Fahrt mit 40km/h dann Halt", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      10 : {DE : "Fahrt mit 40km/h dann 40km/h", },
  }},
  "HpSig_E_V100_Vs_l_69_V8" : {
    Name : {DE : "HpSig_E_V100_Vs_l_69_V8", EN : "HpSig_E_V100_Vs_l_69_V8", FR : "HpSig_E_V100_Vs_l_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann 40km/h", },
      5 : {DE : "Fahrt mit 100km/h dann Halt", },
      6 : {DE : "Fahrt mit 100km/h dann Fahrt", },
      7 : {DE : "Fahrt mit 100km/h dann 40km/h", },
      8 : {DE : "Fahrt mit 40km/h dann Halt", },
      9 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      10 : {DE : "Fahrt mit 40km/h dann 40km/h", },
  }},
  "HpSig_E_V100_Vs_V60_69_V8" : {
    Name : {DE : "HpSig_E_V100_Vs_V60_69_V8", EN : "HpSig_E_V100_Vs_V60_69_V8", FR : "HpSig_E_V100_Vs_V60_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann Fahrt mit 60km/h", },
      5 : {DE : "Fahrt dann Fahrt mit 40km/h", },
      6 : {DE : "Fahrt mit 100km/h dann Halt", },
      7 : {DE : "Fahrt mit 100km/h dann Fahrt", },
      8 : {DE : "Fahrt mit 100km/h dann Fahrt mit 60km/h", },
      9 : {DE : "Fahrt mit 100km/h dann Fahrt mit 40km/h", },
      10 : {DE : "Fahrt mit 40km/h dann Halt", },
      11 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      12 : {DE : "Fahrt mit 40km/h dann Fahrt mit 40km/h", },
  }},
  "HpSig_E_V100_Vs_V60_l_69_V8" : {
    Name : {DE : "HpSig_E_V100_Vs_V60_l_69_V8", EN : "HpSig_E_V100_Vs_V60_l_69_V8", FR : "HpSig_E_V100_Vs_V60_l_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann Fahrt mit 60km/h", },
      5 : {DE : "Fahrt dann Fahrt mit 40km/h", },
      6 : {DE : "Fahrt mit 100km/h dann Halt", },
      7 : {DE : "Fahrt mit 100km/h dann Fahrt", },
      8 : {DE : "Fahrt mit 100km/h dann Fahrt mit 60km/h", },
      9 : {DE : "Fahrt mit 100km/h dann Fahrt mit 40km/h", },
      10 : {DE : "Fahrt mit 40km/h dann Halt", },
      11 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      12 : {DE : "Fahrt mit 40km/h dann Fahrt mit 40km/h", },
  }},
  "HpSig_E_V100_Vs_V80_69_V8" : {
    Name : {DE : "HpSig_E_V100_Vs_V80_69_V8", EN : "HpSig_E_V100_Vs_V80_69_V8", FR : "HpSig_E_V100_Vs_V80_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann Fahrt mit 80km/h", },
      5 : {DE : "Fahrt dann Fahrt mit 40km/h", },
      6 : {DE : "Fahrt mit 100km/h dann Halt", },
      7 : {DE : "Fahrt mit 100km/h dann Fahrt", },
      8 : {DE : "Fahrt mit 100km/h dann Fahrt mit 80km/h", },
      9 : {DE : "Fahrt mit 100km/h dann Fahrt mit 40km/h", },
      10 : {DE : "Fahrt mit 40km/h dann Halt", },
      11 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      12 : {DE : "Fahrt mit 40km/h dann Fahrt mit 40km/h", },
  }},
  "HpSig_E_V100_Vs_V80_l_69_V8" : {
    Name : {DE : "HpSig_E_V100_Vs_V80_l_69_V8", EN : "HpSig_E_V100_Vs_V80_l_69_V8", FR : "HpSig_E_V100_Vs_V80_l_69_V8", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt dann Halt", },
      3 : {DE : "Fahrt dann Fahrt", },
      4 : {DE : "Fahrt dann Fahrt mit 80km/h", },
      5 : {DE : "Fahrt dann Fahrt mit 40km/h", },
      6 : {DE : "Fahrt mit 100km/h dann Halt", },
      7 : {DE : "Fahrt mit 100km/h dann Fahrt", },
      8 : {DE : "Fahrt mit 100km/h dann Fahrt mit 80km/h", },
      9 : {DE : "Fahrt mit 100km/h dann Fahrt mit 40km/h", },
      10 : {DE : "Fahrt mit 40km/h dann Halt", },
      11 : {DE : "Fahrt mit 40km/h dann Fahrt", },
      12 : {DE : "Fahrt mit 40km/h dann Fahrt mit 40km/h", },
  }},
  "HpSig_E_Vmax_EpIII" : {
    Name : {DE : "HpSig E Vmax EpIII", EN : "Ra_HpSig_E_Vmax_EpIII", FR : "F_Hp_E_Vmax_EpIII", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "HpSig_E_Vmax_EpIV" : {
    Name : {DE : "HpSig E Vmax EpIV", EN : "Ra_HpSig_E_Vmax_EpIV", FR : "F_Hp_E_Vmax_EpIV", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "HpSig_E_Vmax_Vr0_EpIV" : {
    Name : {DE : "HpSig E Vmax Vr0 EpIV", EN : "Ra_HpSig_E_Vmax_Vr0_EpIV", FR : "F_HpSig_E_Vmax_Vr0_EpIV", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "HpSig_EZ_V40_Vs_69_V7" : {
    Name : {DE : "HpSig_EZ_V40_Vs_69_V7", EN : "HpSig_EZ_V40_Vs_69_V7", FR : "HpSig_EZ_V40_Vs_69_V7", },
    Pos : {
      1 : {DE : "Halt", },
      2 : {DE : "Fahrt - Halt erwarten", },
      3 : {DE : "Fahrt - Fahrt erwarten", },
      4 : {DE : "Fahrt - Fahrt mit 40km/h erwarten", },
      5 : {DE : "Fahrt mit 40km/h - Halt erwarten", },
      6 : {DE : "Fahrt mit 40km/h - Fahrt erwarten", },
      7 : {DE : "Fahrt mit 40km/h - Fahrt mit 40km/h erwarten", },
  }},
  "HpSig_EZw_V40_Vr0_EpIV" : {
    Name : {DE : "HpSig EZw V40 Vr0 EpIV", EN : "Ra_HpSig_EZw_V40_Vr0_EpIV", FR : "F_HpSig_EZw_V40_Vr0_EpIV", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "HpSig_EZw_Vmax_EpIV" : {
    Name : {DE : "HpSig EZw Vmax EpIV", EN : "Ra_HpSig_EZw_Vmax_EpIV", FR : "F_HpSig_EZw_Vmax_EpIV", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "HpSig_EZw_Vmax_Vr0_EpIV" : {
    Name : {DE : "HpSig EZw Vmax Vr0 EpIV", EN : "Ra_HpSig_EZw_Vmax_Vr0_EpIV", FR : "F_HpSig_EZw_Vmax_Vr0_EpIV", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "PI5_HP01_Form" : {
    Name : {DE : "HP01 Form (PL5)", EN : "Ra_PI5_HP01_Form", FR : "F_PI5_HP01_Form", },
    Pos : {
      1 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
      2 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
  }},
  "PI5_HP01_Form_oVSig" : {
    Name : {DE : "HP01 Form oVSig (PL5)", EN : "Ra_PI5_HP01_Form_oVSig", FR : "F_PI5_HP01_Form_oVSig", },
    Pos : {
      1 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
      2 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
  }},
  "PI5_HP02_Form" : {
    Name : {DE : "HP02 Form (mehrbegriffig)", EN : "Ra_PI5_HP02_Form", FR : "F_PI5_HP02_Form", },
    Pos : {
      1 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
      2 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      3 : {DE : "Fahrt mit 40km/h", EN : "Slow at 40km/h", FR : "Marche à vue 40km/h", },
  }},
  "PI5_HP02_Form_oVSig" : {
    Name : {DE : "HP02 Form oVSig (mehrbegriffig)", EN : "Ra_PI5_HP02_Form_oVSig", FR : "F_PI5_HP02_Form_oVSig", },
    Pos : {
      1 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
      2 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      3 : {DE : "Fahrt mit 40km/h", EN : "Slow at 40km/h", FR : "Marche à vue 40km/h", },
  }},
  "PI5_HP02_Form_V60T" : {
    Name : {DE : "HP02 Form V60T (mehrbegriffig)", EN : "Ra_PI5_HP02_Form_V60T", FR : "F_PI5_HP02_Form_V60T", },
    Pos : {
      1 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
      2 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      3 : {DE : "Fahrt mit 60km/h", EN : "Slow at 60km/h", FR : "Marche à vue 60km/h", },
  }},
  "PI5_HP02_Form_V60T_oVSig" : {
    Name : {DE : "HP02 Form V60T oVSig (mehrbegriffig)", EN : "Ra_PI5_HP02_Form_V60T_oVSig", FR : "F_PI5_HP02_Form_V60T_oVSig", },
    Pos : {
      1 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
      2 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      3 : {DE : "Fahrt mit 60km/h", EN : "Slow at 60km/h", FR : "Marche à vue 60km/h", },
  }},
  "PI5_HP02_Form_Vr0" : {
    Name : {DE : "HP02 Form Vr0 (mehrbegriffig)", EN : "Ra_PI5_HP02_Form_Vr0", FR : "F_PI5_HP02_Form_Vr0", },
    Pos : {
      1 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
      2 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      3 : {DE : "Fahrt mit 40km/h", EN : "Slow at 40km/h", FR : "Marche à vue 40km/h", },
      4 : {DE : "Langsamfahrt erwarten", EN : "expect Slow ahead", FR : "Prochain signal approche lente", },
  }},
  "PI5_HP02_Form_Vr0_oVSig" : {
    Name : {DE : "HP02 Form Vr0 oVSig (mehrbegriffig)", EN : "Ra_PI5_HP02_Form_Vr0_oVSig", FR : "F_PI5_HP02_Form_Vr0_oVSig", },
    Pos : {
      1 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
      2 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      3 : {DE : "Fahrt mit 40km/h", EN : "Slow at 40km/h", FR : "Marche à vue 40km/h", },
      4 : {DE : "Langsamfahrt erwarten", EN : "expect Slow ahead", FR : "Prochain signal approche lente", },
  }},
  "PI5_RaSig_mech" : {
    Name : {DE : "RaSig mech (mehrbegriffig)", EN : "Ra_PI5_RaSig_mech", FR : "F_PI5_RaSig_mech", },
    Pos : {
      1 : {DE : "Halt", EN : "Stop", FR : "Arrêt", },
      2 : {DE : "Langsam abdrücken", EN : "Slow push", FR : "Freinage lent", },
      3 : {DE : "Schnell abdrücken", EN : "Fast push", FR : "Freinage rapide", },
  }},
  "PI5_ShSig_Form" : {
    Name : {DE : "ShSig Form (PL5)", EN : "Ra_PI5_ShSig_Form", FR : "F_PI5_ShSig_Form", },
    Pos : {
      1 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
      2 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
  }},
  "ShSig_Form" : {
    Name : {DE : "ShSig Form", EN : "Ra_ShSig_Form", FR : "F_ShSig", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "ShSig_Licht_EpIV" : {
    Name : {DE : "ShSig Licht EpIV", EN : "Ra_ShSig_Lights_EpIV", FR : "F_ShSig_Feux_EpIV", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "ShSig_Licht_EpIV_kl" : {
    Name : {DE : "ShSig Licht EpIV kl", EN : "Ra ShSig lights EpIV short", FR : "F_ShSig_Feux_EpIV_kl", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Clear", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Danger", FR : "Arrêt", },
  }},
  "Sign_Counter_SM2" : {
    Name : {DE : "Signal - Zähler (0-98)", EN : "Signal - counter (0-98)", FR : "Signal - compteur (0-98)", },
    Pos : {
      1 : {DE : "00", EN : "00", FR : "00", },
      2 : {DE : "01", EN : "01", FR : "01", },
      3 : {DE : "02", EN : "02", FR : "02", },
      4 : {DE : "03", EN : "03", FR : "03", },
      5 : {DE : "04", EN : "04", FR : "04", },
      6 : {DE : "05", EN : "05", FR : "05", },
      7 : {DE : "06", EN : "06", FR : "06", },
      8 : {DE : "07", EN : "07", FR : "07", },
      9 : {DE : "08", EN : "08", FR : "08", },
      10 : {DE : "09", EN : "09", FR : "09", },
      11 : {DE : "10", EN : "10", FR : "10", },
      12 : {DE : "11", EN : "11", FR : "11", },
      13 : {DE : "12", EN : "12", FR : "12", },
      14 : {DE : "13", EN : "13", FR : "13", },
      15 : {DE : "14", EN : "14", FR : "14", },
      16 : {DE : "15", EN : "15", FR : "15", },
      17 : {DE : "16", EN : "16", FR : "16", },
      18 : {DE : "17", EN : "17", FR : "17", },
      19 : {DE : "18", EN : "18", FR : "18", },
      20 : {DE : "19", EN : "19", FR : "19", },
      21 : {DE : "20", EN : "20", FR : "20", },
      22 : {DE : "21", EN : "21", FR : "21", },
      23 : {DE : "22", EN : "22", FR : "22", },
      24 : {DE : "23", EN : "23", FR : "23", },
      25 : {DE : "24", EN : "24", FR : "24", },
      26 : {DE : "25", EN : "25", FR : "25", },
      27 : {DE : "26", EN : "26", FR : "26", },
      28 : {DE : "27", EN : "27", FR : "27", },
      29 : {DE : "28", EN : "28", FR : "28", },
      30 : {DE : "29", EN : "29", FR : "29", },
      31 : {DE : "30", EN : "30", FR : "30", },
      32 : {DE : "31", EN : "31", FR : "31", },
      33 : {DE : "32", EN : "32", FR : "32", },
      34 : {DE : "33", EN : "33", FR : "33", },
      35 : {DE : "34", EN : "34", FR : "34", },
      36 : {DE : "35", EN : "35", FR : "35", },
      37 : {DE : "36", EN : "36", FR : "36", },
      38 : {DE : "37", EN : "37", FR : "37", },
      39 : {DE : "38", EN : "38", FR : "38", },
      40 : {DE : "39", EN : "39", FR : "39", },
      41 : {DE : "40", EN : "40", FR : "40", },
      42 : {DE : "41", EN : "41", FR : "41", },
      43 : {DE : "42", EN : "42", FR : "42", },
      44 : {DE : "43", EN : "43", FR : "43", },
      45 : {DE : "44", EN : "44", FR : "44", },
      46 : {DE : "45", EN : "45", FR : "45", },
      47 : {DE : "46", EN : "46", FR : "46", },
      48 : {DE : "47", EN : "47", FR : "47", },
      49 : {DE : "48", EN : "48", FR : "48", },
      50 : {DE : "49", EN : "49", FR : "49", },
      51 : {DE : "50", EN : "50", FR : "50", },
      52 : {DE : "51", EN : "51", FR : "51", },
      53 : {DE : "52", EN : "52", FR : "52", },
      54 : {DE : "53", EN : "53", FR : "53", },
      55 : {DE : "54", EN : "54", FR : "54", },
      56 : {DE : "55", EN : "55", FR : "55", },
      57 : {DE : "56", EN : "56", FR : "56", },
      58 : {DE : "57", EN : "57", FR : "57", },
      59 : {DE : "58", EN : "58", FR : "58", },
      60 : {DE : "59", EN : "59", FR : "59", },
      61 : {DE : "60", EN : "60", FR : "60", },
      62 : {DE : "61", EN : "61", FR : "61", },
      63 : {DE : "62", EN : "62", FR : "62", },
      64 : {DE : "63", EN : "63", FR : "63", },
      65 : {DE : "64", EN : "64", FR : "64", },
      66 : {DE : "65", EN : "65", FR : "65", },
      67 : {DE : "66", EN : "66", FR : "66", },
      68 : {DE : "67", EN : "67", FR : "67", },
      69 : {DE : "68", EN : "68", FR : "68", },
      70 : {DE : "69", EN : "69", FR : "69", },
      71 : {DE : "70", EN : "70", FR : "70", },
      72 : {DE : "71", EN : "71", FR : "71", },
      73 : {DE : "72", EN : "72", FR : "72", },
      74 : {DE : "73", EN : "73", FR : "73", },
      75 : {DE : "74", EN : "74", FR : "74", },
      76 : {DE : "75", EN : "75", FR : "75", },
      77 : {DE : "76", EN : "76", FR : "76", },
      78 : {DE : "77", EN : "77", FR : "77", },
      79 : {DE : "78", EN : "78", FR : "78", },
      80 : {DE : "79", EN : "79", FR : "79", },
      81 : {DE : "80", EN : "80", FR : "80", },
      82 : {DE : "81", EN : "81", FR : "81", },
      83 : {DE : "82", EN : "82", FR : "82", },
      84 : {DE : "83", EN : "83", FR : "83", },
      85 : {DE : "84", EN : "84", FR : "84", },
      86 : {DE : "85", EN : "85", FR : "85", },
      87 : {DE : "86", EN : "86", FR : "86", },
      88 : {DE : "87", EN : "87", FR : "87", },
      89 : {DE : "88", EN : "88", FR : "88", },
      90 : {DE : "89", EN : "89", FR : "89", },
      91 : {DE : "90", EN : "90", FR : "90", },
      92 : {DE : "91", EN : "91", FR : "91", },
      93 : {DE : "92", EN : "92", FR : "92", },
      94 : {DE : "93", EN : "93", FR : "93", },
      95 : {DE : "94", EN : "94", FR : "94", },
      96 : {DE : "95", EN : "95", FR : "95", },
      97 : {DE : "96", EN : "96", FR : "96", },
      98 : {DE : "97", EN : "97", FR : "97", },
      99 : {DE : "98", EN : "98", FR : "98", },
  }},
  "Sign_Countr1_SM2" : {
    Name : {DE : "Signal - Zähler (0-9)", EN : "Signal - counter (0-9)", FR : "Signal - compteur (0-9)", },
    Pos : {
      1 : {DE : "0", EN : "0", FR : "0", },
      2 : {DE : "1", EN : "1", FR : "1", },
      3 : {DE : "2", EN : "2", FR : "2", },
      4 : {DE : "3", EN : "3", FR : "3", },
      5 : {DE : "4", EN : "4", FR : "4", },
      6 : {DE : "5", EN : "5", FR : "5", },
      7 : {DE : "6", EN : "6", FR : "6", },
      8 : {DE : "7", EN : "7", FR : "7", },
      9 : {DE : "8", EN : "8", FR : "8", },
      10 : {DE : "9", EN : "9", FR : "9", },
  }},
  "signal_1" : {
    Name : {DE : "Ampel 3 (mehrbegriffig)", EN : "Traffic light 3 (multi phase)", FR : "Ampel 3 (mehrbegriffig)", },
    Pos : {
      1 : {DE : "Fahrt, Grün", EN : "Green", },
      2 : {DE : "Halt, Rot", EN : "Red", },
      3 : {DE : "Halt, Gelb", EN : "Yellow", },
      4 : {DE : "Max. Geschwindigkeit 50 km/h, Gelb blinkend", EN : "Yellow flashing", },
  }},
  "signal_2" : {
    Name : {DE : "Ampel 4 (mehrbegriffig)", EN : "Traffic light 4 (multi phase)", FR : "Ampel 4 (mehrbegriffig)", },
    Pos : {
      1 : {DE : "Fahrt, Grün", EN : "Green", },
      2 : {DE : "Halt, Rot", EN : "Red", },
      3 : {DE : "Halt, Gelb", EN : "Yellow", },
      4 : {DE : "Max. Geschwindigkeit 50 km/h, Gelb blinkend", EN : "Yellow flashing", },
  }},
  "Signal_unsichtbar" : {
    Name : {DE : "Unsichtbares Signal", EN : "x_Invisible_Signal", FR : "x_Signal invisible", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Go", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Stop", FR : "Arrêt", },
  }},
  "StartSwitch_usertex" : {
    Name : {DE : "Anlagen Startsignal (User)", EN : "On-Off switch (User)", FR : "Anlagen Startsignal (User)", },
    Pos : {
      1 : {DE : "Fahrt", EN : "On", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Off", FR : "Arrêt", },
  }},
  "Strab_Signal" : {
    Name : {DE : "Strab Signal", EN : "Tr_Tram_Front direction", FR : "T_Direction devant", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Go", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Stop", FR : "Arrêt", },
  }},
  "Strab_Signal_L" : {
    Name : {DE : "Strab Signal L", EN : "Tr_Tram_Signal_Left", FR : "T_Direction gauche", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Go", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Stop", FR : "Arrêt", },
  }},
  "Strab_Signal_R" : {
    Name : {DE : "Strab Signal R", EN : "Tr_Tram_Signal_Right", FR : "T_Direction à droite", },
    Pos : {
      1 : {DE : "Fahrt", EN : "Go", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Stop", FR : "Arrêt", },
  }},
  "Switch_lying" : {
    Name : {DE : "Anlagen Startsignal liegend", EN : "On-Off switch level ", FR : "Switch_lying", },
    Pos : {
      1 : {DE : "Fahrt", EN : "On", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Off", FR : "Arrêt", },
  }},
  "Switch_standing" : {
    Name : {DE : "Anlagen Startsignal stehend", EN : "On-Off switch upright", FR : "Switch_standing", },
    Pos : {
      1 : {DE : "Fahrt", EN : "On", FR : "Voie libre", },
      2 : {DE : "Halt", EN : "Off", FR : "Arrêt", },
  }},
  "SysSign_Logic_SM2" : {
    Name : {DE : "unsichtbares Signal (Logik)", EN : "x_Invisible_Signal (logic)", FR : "x_Invisible_Signal (logic)", },
    Pos : {
      1 : {DE : "01", EN : "01", FR : "01", },
      2 : {DE : "02", EN : "02", FR : "02", },
      3 : {DE : "03", EN : "03", FR : "03", },
      4 : {DE : "04", EN : "04", FR : "04", },
      5 : {DE : "05", EN : "05", FR : "05", },
      6 : {DE : "06", EN : "06", FR : "06", },
      7 : {DE : "07", EN : "07", FR : "07", },
      8 : {DE : "08", EN : "08", FR : "08", },
      9 : {DE : "09", EN : "09", FR : "09", },
      10 : {DE : "10", EN : "10", FR : "10", },
      11 : {DE : "11", EN : "11", FR : "11", },
      12 : {DE : "12", EN : "12", FR : "12", },
      13 : {DE : "13", EN : "13", FR : "13", },
      14 : {DE : "14", EN : "14", FR : "14", },
      15 : {DE : "15", EN : "15", FR : "15", },
      16 : {DE : "16", EN : "16", FR : "16", },
      17 : {DE : "17", EN : "17", FR : "17", },
      18 : {DE : "18", EN : "18", FR : "18", },
      19 : {DE : "19", EN : "19", FR : "19", },
      20 : {DE : "20", EN : "20", FR : "20", },
      21 : {DE : "21", EN : "21", FR : "21", },
      22 : {DE : "22", EN : "22", FR : "22", },
      23 : {DE : "23", EN : "23", FR : "23", },
      24 : {DE : "24", EN : "24", FR : "24", },
      25 : {DE : "25", EN : "25", FR : "25", },
      26 : {DE : "26", EN : "26", FR : "26", },
      27 : {DE : "27", EN : "27", FR : "27", },
      28 : {DE : "28", EN : "28", FR : "28", },
      29 : {DE : "29", EN : "29", FR : "29", },
      30 : {DE : "30", EN : "30", FR : "30", },
      31 : {DE : "31", EN : "31", FR : "31", },
      32 : {DE : "32", EN : "32", FR : "32", },
      33 : {DE : "33", EN : "33", FR : "33", },
      34 : {DE : "34", EN : "34", FR : "34", },
      35 : {DE : "35", EN : "35", FR : "35", },
      36 : {DE : "36", EN : "36", FR : "36", },
      37 : {DE : "37", EN : "37", FR : "37", },
      38 : {DE : "38", EN : "38", FR : "38", },
      39 : {DE : "39", EN : "39", FR : "39", },
      40 : {DE : "40", EN : "40", FR : "40", },
      41 : {DE : "41", EN : "41", FR : "41", },
      42 : {DE : "42", EN : "42", FR : "42", },
      43 : {DE : "43", EN : "43", FR : "43", },
      44 : {DE : "44", EN : "44", FR : "44", },
      45 : {DE : "45", EN : "45", FR : "45", },
      46 : {DE : "46", EN : "46", FR : "46", },
      47 : {DE : "47", EN : "47", FR : "47", },
      48 : {DE : "48", EN : "48", FR : "48", },
      49 : {DE : "49", EN : "49", FR : "49", },
      50 : {DE : "50", EN : "50", FR : "50", },
      51 : {DE : "51", EN : "51", FR : "51", },
      52 : {DE : "52", EN : "52", FR : "52", },
      53 : {DE : "53", EN : "53", FR : "53", },
      54 : {DE : "54", EN : "54", FR : "54", },
      55 : {DE : "55", EN : "55", FR : "55", },
      56 : {DE : "56", EN : "56", FR : "56", },
      57 : {DE : "57", EN : "57", FR : "57", },
      58 : {DE : "58", EN : "58", FR : "58", },
      59 : {DE : "59", EN : "59", FR : "59", },
      60 : {DE : "60", EN : "60", FR : "60", },
      61 : {DE : "61", EN : "61", FR : "61", },
      62 : {DE : "62", EN : "62", FR : "62", },
      63 : {DE : "63", EN : "63", FR : "63", },
      64 : {DE : "64", EN : "64", FR : "64", },
      65 : {DE : "65", EN : "65", FR : "65", },
      66 : {DE : "66", EN : "66", FR : "66", },
      67 : {DE : "67", EN : "67", FR : "67", },
      68 : {DE : "68", EN : "68", FR : "68", },
      69 : {DE : "69", EN : "69", FR : "69", },
      70 : {DE : "70", EN : "70", FR : "70", },
      71 : {DE : "71", EN : "71", FR : "71", },
      72 : {DE : "72", EN : "72", FR : "72", },
      73 : {DE : "73", EN : "73", FR : "73", },
      74 : {DE : "74", EN : "74", FR : "74", },
      75 : {DE : "75", EN : "75", FR : "75", },
      76 : {DE : "76", EN : "76", FR : "76", },
      77 : {DE : "77", EN : "77", FR : "77", },
      78 : {DE : "78", EN : "78", FR : "78", },
      79 : {DE : "79", EN : "79", FR : "79", },
      80 : {DE : "80", EN : "80", FR : "80", },
      81 : {DE : "81", EN : "81", FR : "81", },
      82 : {DE : "82", EN : "82", FR : "82", },
      83 : {DE : "83", EN : "83", FR : "83", },
      84 : {DE : "84", EN : "84", FR : "84", },
      85 : {DE : "85", EN : "85", FR : "85", },
      86 : {DE : "86", EN : "86", FR : "86", },
      87 : {DE : "87", EN : "87", FR : "87", },
      88 : {DE : "88", EN : "88", FR : "88", },
      89 : {DE : "89", EN : "89", FR : "89", },
      90 : {DE : "90", EN : "90", FR : "90", },
      91 : {DE : "91", EN : "91", FR : "91", },
      92 : {DE : "92", EN : "92", FR : "92", },
      93 : {DE : "93", EN : "93", FR : "93", },
      94 : {DE : "94", EN : "94", FR : "94", },
      95 : {DE : "95", EN : "95", FR : "95", },
      96 : {DE : "96", EN : "96", FR : "96", },
      97 : {DE : "97", EN : "97", FR : "97", },
      98 : {DE : "98", EN : "98", FR : "98", },
      99 : {DE : "99", EN : "99", FR : "99", },
  }},
  "USPRR292_280_285a_29110BS1" : {
    Name : {DE : "US_PRR_292_280_285a_291_10", EN : "US_PRR_292_280_285a_291_10", FR : "US_PRR_292_280_285a_291_10", },
    Pos : {
      1 : {EN : "Stop 292", },
      2 : {EN : "Clear_Block_280", },
      3 : {EN : "Caution_285a", },
      4 : {EN : "Stop and Proceed_291", },
      5 : {EN : ">Caution_285a", },
      6 : {EN : ">Stop and Proceed_291", },
  }},
  "USPRR292_281_285_28910BS1" : {
    Name : {DE : "US_PRR_292_281_285_289_10", EN : "US_PRR_292_281_285_289_10", FR : "US_PRR_292_281_285_289_10", },
    Pos : {
      1 : {EN : "Clear_281", },
      2 : {EN : ">Approach_285", },
      3 : {EN : "Stop 292", },
      4 : {EN : ">Permissive Blk_289", },
  }},
  "USPRR292_282_28310BS1" : {
    Name : {DE : "US_PRR_292_282_283_10", EN : "US_PRR_292_282_283_10", FR : "US_PRR_292_282_283_10", },
    Pos : {
      1 : {EN : "Stop 292", },
      2 : {EN : "Approach_Medium_282", },
      3 : {EN : "Medium Clear", },
      4 : {EN : ">Approach_Medium_282", },
      5 : {EN : ">Medium Clear", },
  }},
  "USPRR292_288_284_283a10BS1" : {
    Name : {DE : "US_PRR_292_288_284_283a_10", EN : "US_PRR_292_288_284_283a_10", FR : "US_PRR_292_288_284_283a_10", },
    Pos : {
      1 : {EN : "Stop 292", },
      3 : {EN : "Approach Slow_284", },
      4 : {EN : "Medium Aproach_283a", },
      5 : {EN : ">Slow Approach_288", },
      6 : {EN : ">Approach Slow_284", },
      7 : {EN : ">Medium Aproach_283a", },
  }},
  "USPRR292_29010BS1" : {
    Name : {DE : "US_PRR_292_290_10", EN : "US_PRR_292_290_10", FR : "US_PRR_292_290_10", },
    Pos : {
      1 : {EN : "Stop 292", },
      2 : {EN : "Restricting_290", },
      3 : {EN : ">Restricting_290", },
  }},
  "USPRR292r_280_285a_29110BS1" : {
    Name : {DE : "US_PRR_292r_280_285a_291_10", EN : "US_PRR_292r_280_285a_291_10", FR : "US_PRR_292r_280_285a_291_10", },
    Pos : {
      1 : {EN : "Stop 292", },
      2 : {EN : "Clear_Block_280", },
      3 : {EN : "Caution_285a", },
      4 : {EN : "Stop and Proceed_291", },
      5 : {EN : ">Caution_285a", },
      6 : {EN : ">Stop and Proceed_291", },
  }},
  "USPRR292r_281_285_28910BS1" : {
    Name : {DE : "US_PRR_292r_281_285_289_10", EN : "US_PRR_292r_281_285_289_10", FR : "US_PRR_292r_281_285_289_10", },
    Pos : {
      1 : {EN : "Stop 292", },
      2 : {EN : "Clear_281", },
      3 : {EN : "Approach_285", },
      4 : {EN : "Permissive Blk_289", },
      5 : {EN : ">Approach_285", },
      6 : {EN : ">Permissive Blk_289", },
  }},
  "USPRR292r_288_284_283a10BS1" : {
    Name : {DE : "US_PRR_292r_288_284_283a_10", EN : "US_PRR_292r_288_284_283a_10", FR : "US_PRR_292r_288_284_283a_10", },
    Pos : {
      1 : {EN : "Stop 292", },
      3 : {EN : "Approach Slow_284", },
      4 : {EN : "Medium Aproach_283a", },
      5 : {EN : ">Slow Approach_288", },
      6 : {EN : ">Approach Slow_284", },
      7 : {EN : ">Medium Aproach_283a", },
  }},
  "USPRR292r_29010BS1" : {
    Name : {DE : "US_PRR_292r_290_10", EN : "US_PRR_292r_290_10", FR : "US_PRR_292r_290_10", },
    Pos : {
      1 : {EN : "Stop 292", },
      2 : {EN : "Restricting_290", },
      3 : {EN : ">Restricting_290", },
  }},
  "FS_Schalter_Start_sp_Stw_v7_2" : {
    Name : {DE : "FS_Schalter_Start_sp_Stw_v7", EN : "FS_Schalter_Start_sp_Stw_v7", FR : "FS_Schalter_Start_sp_Stw_v7", },
    Pos : {
      1 : {DE : "frei", },
      2 : {DE : "eingestellt", },
  }},
  "FS_Schalter_Start_Stw_v7_2" : {
    Name : {DE : "FS_Schalter_Start_Stw_v7", EN : "FS_Schalter_Start_Stw_v7", FR : "FS_Schalter_Start_Stw_v7", },
    Pos : {
      1 : {DE : "frei", },
      2 : {DE : "eingestellt", },
  }},
  "FS_Schalter_Ziel_sp_Stw_v7_2" : {
    Name : {DE : "FS_Schalter_Ziel_sp_Stw_v7", EN : "FS_Schalter_Ziel_sp_Stw_v7", FR : "FS_Schalter_Ziel_sp_Stw_v7", },
    Pos : {
      1 : {DE : "Ziel", },
      2 : {DE : "eingestellt", },
      3 : {DE : "Störung", },
  }},
  "FS_Schalter_Ziel_Stw_v7_2" : {
    Name : {DE : "FS_Schalter_Ziel_Stw_v7", EN : "FS_Schalter_Ziel_Stw_v7", FR : "FS_Schalter_Ziel_Stw_v7", },
    Pos : {
      1 : {DE : "Ziel", },
      2 : {DE : "eingestellt", },
      3 : {DE : "Störung", },
  }},  
}