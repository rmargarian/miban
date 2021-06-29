//export const emailRegex = /^\s*(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))\s*$/;

export const emailRegex = /^\s*[a-zA-Z0-9][a-zA-Z0-9-_\.]+@((([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))\s*$/;
export const nameRegex = /^[a-z][a-z\s-\']*$/i;
export const TOKEN: string = 'SEcretPFA18+neGotiaT*toK;en';
export const phoneRegex = /^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/;
export const siteKey = '6Ld56bUUAAAAAJFiR6bOkNd5K9VpTPGXNCHQRF-s';
export const secretSiteKey = '6Ld56bUUAAAAAJUqDTZp0HfiwmWUzCQj1yWc7W7J';

export const mFieldsTooltip = 'Please complete all mandatory fields';
export const mQuestionsTooltip = 'Please complete all mandatory questions';


export const EXCLUDES: string = `
better,close,
i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,
what,which,who,whom,whose,this,that,these,those,think,
am,is,are,was,were,
be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,
he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,
isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,
let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,
a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,
against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,
here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,
so,than,too,very,say,says,said,shall
  a, ii, above, according, across, actually, ad, adj, ae, af, after, afterwards, ag, again,
  against, ai, al, all, almost, alone, along, already, also, although, always, am, among, amongst, amp,
  an, and, another, any, anyhow, anyone, anything, anywhere, ao, aq, ar, are, aren, arent, around, arpa,
  as, at, au, aw, az, b, ba, bb, bd, be, became, because, become, becomes, becoming, been, before,
  beforehand, begin, beginning, behind, being, below, beside, besides, between, beyond, bf, bg, bh, bi,
  billion, bj, bm, bn, bo, both, br, bs, bt, but, buy, bv, bw, by, bz, c, ca, can, cant,
  cannot, caption, cc, cd, cf, cg, ch, ci, ck, cl, click, cm, cn, co, co., com, come, copy, could,
  couldn, couldnt, cr, cs, cu, cv, cx, cy, cz, d, de, did, didn, didnt, dj, dk, dm, do, does,
  doesn, doesnt, don, dont, down, during, dz, e, each, ec, edu, ee, eg, eh, eight, eighty, either,
  else, elsewhere, end, ending, enough, er, es, et, etc, even, ever, every, everyone, everything, everywhere,
  except, f, few, fi, fifty, find, first, five, fj, fk, fm, fo, for, former, formerly, forty, found,
  four, fr, free, from, further, fx, g, ga, gb, gd, ge, gf, gg, gh, gi, gl, gm, gmt, gn, go, gov,
  gp, gq, gr, gs, gt, gu, gw, gy, h, had, has, hasn, hasnt, have, haven, havent, he, hed,
  hell, hes, help, hence, her, here, heres, hereafter, hereby, herein, hereupon, hers, herself, him,
  himself, his, hk, hm, hn, home, homepage, how, however, hr, ht, htm, html, http, hu, hundred, i,
  id, ill, im, ive, i.e., id, ie, if, il, im, in, inc, inc., indeed, information, instead, int,
  into, io, iq, ir, is, isn, isnt, it, its, its, itself, j, je, jm, jo, join, jp, k, ke, kg,
  kh, ki, km, kn, kp, kr, kw, ky, kz, l, la, last, later, latter, lb, lc, least, less, let, lets,
  li, like, likely, lk, ll, lr, ls, lt, ltd, lu, lv, ly, m, ma, made, make, makes, many, maybe, mc,
  md, me, meantime, meanwhile, mg, mh, microsoft, might, mil, million, miss, mk, ml, mm, mn, mo, more,
  moreover, most, mostly, mp, mq, mr, mrs, ms, msie, mt, mu, much, must, mv, mw, mx, my, myself, mz,
  n, na, namely, nc, ne, neither, net, netscape, never, nevertheless, new, next, nf, ng, ni, nine, ninety,
  nl, no, nobody, none, nonetheless, noone, nor, not, nothing, now, nowhere, np, nr, nu, nz, o, of, off,
  often, om, on, once, one, ones, only, onto, or, org, other, others, otherwise, our, ours, ourselves,
  out, over, overall, own, p, pa, page, pe, per, perhaps, pf, pg, ph, pk, pl, pm, pn, pr, pt, pw,
  py, q, qa, r, rather, re, recent, recently, reserved, ring, ro, ru, rw, s, sa, same, sb, sc, sd,
  se, seem, seemed, seeming, seems, seven, seventy, several, sg, sh, she, shed, shell, shes, should,
  shouldn, shouldnt, si, since, site, six, sixty, sj, sk, sl, sm, sn, some, somehow, someone,
  something, sometime, sometimes, somewhere, sr, st, still, stop, su, such, sv, sy, sz, t, taking, tc, td,
  ten, text, tf, tg, test, th, that, that'll, thats, the, their, them, themselves, then, thence,
  there, therell, theres, thereafter, thereby, therefore, therein, thereupon, these, they, theyd, theyll,
  theyre, theyve, thirty, this, those, though, thousand, three, through, throughout, thru, thus, tj, tk,
  tm, tn, to, together, toward, towards, tp, tr, trillion, tt, tv, tw, twenty, two, tz, u, ua, ug,
  uk, um, under, unless, unlike, unlikely, until, up, upon, us, use, used, using, uy, uz, v, va, vc, ve,
  very, vg, vi, via, vn, vu, w, was, wasn, wasnt, we, wed, well, were, weve, web, webpage,
  website, welcome, well, were, weren, werent, wf, what, what'll, whats, whatever, when, whence, whenever,
  where, whereafter, whereas, whereby, wherein, whereupon, wherever, whether, which, while, whither, who, whod,
  wholl, whos, whoever, NULL, whole, whom, whomever, whose, why, will, with, within, without, won, wont,
  would, wouldn, wouldnt, ws, www, x, y, ye, yes, yet, you, youd, youll, youre, youve, your,
  yours, yourself, yourselves, yt, yu, z, za, z, org, inc, width, length, 0, 1, 2, 3, 4, 5, 6, 7, 8,
  9, a, &, 39, get, too, null, zm, zr, 10, z
`;

