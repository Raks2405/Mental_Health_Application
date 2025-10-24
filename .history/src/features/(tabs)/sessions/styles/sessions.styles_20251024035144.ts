import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  text: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffffff'
  },
  modalBody: {
    minHeight: 0,
  },
  centeredTransparent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  sessionTitle: {
    borderWidth: 1,
    borderColor: '#000000ff',
    borderRadius: 3,
    padding: 10,
    marginBottom: 10,
  },
  btn: {
    backgroundColor: '#003d53ff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  btnOutline: {
    backgroundColor: '#ffffffff'
  },
  disabledbtn: {
    backgroundColor: '#656565ff'
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)'
  },

  modalCard: {
    width: '88%',
    backgroundColor: '#93bdd7ff',
    borderRadius: 12,
    borderWidth: 3,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 2, height: 2 },
        shadowColor: '#000000ff',
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: { elevation: 6 }
    })
  },
  loginBtn: {
    backgroundColor: "#003d53ff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  loginBtnPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  androidDate: {
    borderWidth: 1,
    borderColor: '#000000ff',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  adminSessionDescription: {
    height: 250,
    borderWidth: 1,
    borderColor: '#000000ff',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
  },
  subCard: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingStart: 1,
    paddingEnd: 1,
    marginTop: 10,
    marginBottom: 2,
    marginStart: 2,
    marginEnd: 2,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: 'black',
    overflow: 'hidden',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 2, height: 2 },
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: { elevation: 5 }
    })
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 10,
    position: 'relative',
  },

  newBadge: {
    position: 'absolute',
    right: 10,
    top: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'red',
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },

  title: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
    marginRight: 8,
    maxWidth: '75%',
  },
  status: {
    position: 'absolute',
    right: 10,
    bottom: 3,
    fontSize: 12,
    fontWeight: '600',
  },
  meta: {
    fontSize: 14,
    color: 'black',
  },
  metaLabel: {
    fontWeight: 'bold',
  },
  statusUpcoming: { color: '#006613ff', fontWeight: 'bold' },
  statusExpired: { color: '#b50000ff', fontWeight: 'bold' },

  modalCardGradient: {
    width: '90%',
    maxHeight: '88%',
    borderRadius: 18,
    padding: 3,
    alignSelf: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: { elevation: 10 }
    })
  },

  modalGlow: {
    position: 'absolute',
    top: -40,
    left: -30,
    width: 220,
    height: 160,
    borderRadius: 100,
    opacity: 0.8,
  },

  modalCardGlass: {
    backgroundColor: 'rgba(0, 104, 108, 0.35)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.18)',
    maxHeight: '100%'
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },

  metaLight: {
    fontSize: 14,
    color: '#e5e7eb',
    lineHeight: 20,
  },

  metaLabelLight: {
    fontWeight: '700',
    color: '#fafafa',
  },

  modalHeaderRow: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontWeight: '900',
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 6,
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  chipText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  rowBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  rowIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  rowLabel: {
    color: '#000',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  rowValue: {
    color: '#000',
    fontSize: 14,
    lineHeight: 20,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.12)',
    marginVertical: 14,
    borderRadius: 1,
  },

  descBlock: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    alignSelf: 'stretch',
    overflow: 'hidden',
    marginBottom: 12,
  },
  descScroll: {
    maxHeight: 280,
    minHeight: 60,
    alignSelf: 'stretch',
  },
  descHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  descTitle: {
    color: '#000',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  descText: {
    color: '#000',
    fontSize: 14,
    lineHeight: 20,
    width: '100%',
    flexShrink: 1,
  },

  page: {
    flex: 1,
    backgroundColor: "rgba(215, 228, 226, 0.96)",
  },

  fieldLabel: {
    color: '#000',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 6,
  },

  inputGlass: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderColor: 'rgba(0,0,0,0.15)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#000',
    fontSize: 14,
  },

  inputGlassPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderColor: 'rgba(0,0,0,0.15)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  inputGlassText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },

  pickerGlass: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderColor: 'rgba(0,0,0,0.15)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginBottom: 4,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },

  btnGlass: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  btnGlassText: {
    color: '#fff',
    fontWeight: '700',
  },

  btnPrimaryGlass: {
    backgroundColor: 'rgba(34, 197, 94, 0.95)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  btnPrimaryGlassText: {
    color: '#fff',
    fontWeight: '800',
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
