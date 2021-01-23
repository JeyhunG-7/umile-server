INSERT INTO order_status(name) VALUES ('Placed');
INSERT INTO order_status(name) VALUES ('Submitted');
INSERT INTO order_status(name) VALUES ('Scheduled for delivery');
INSERT INTO order_status(name) VALUES ('Out for delivery');
INSERT INTO order_status(name) VALUES ('Delivered');
INSERT INTO order_status(name) VALUES ('Aborted, will try again');

INSERT INTO actions(short_name, name) VALUES ('pickup', 'Pick Up');
INSERT INTO actions(short_name, name) VALUES ('delivery', 'Delivery');

INSERT INTO cities (geom, name, country) VALUES (
	'0106000020E6100000010000000103000000040000000A02000022469DE5FF8E5CC005BE2AC1F7934940A075530EDF8E5CC0574577BDFA934940AC7A2D75DC8E5CC0B4E4F4A1D4934940A772EE6C9A8C5CC080FD54D49A9349406FAFC4ED7E8A5CC0E8CB946F0E94494070072F9B3F8B5CC089B568375E9749406085CCADA9845CC0F2AF5D29329849409340B72483845CC0BA18E900779649404CC4A4C261805CC040BFAA69D5964940340BABCD1A805CC03EE24CE9749649408A7BE62917805CC04E426A5DC1934940F3EA61860D805CC0B4033AD9C0934940BC817EB608805CC0AE7210C5C29149402877F51876825CC049929502409249402877F51876825CC012FB20DA849049405C3F9D27F8825CC0DF3F3663AB9049405C3F9D27F8825CC00EB5F153D38E4940C3967A56F3825CC0D7493282788D4940F5BB0AA29C825CC008175820618C49405B32E08F4F825CC0A174CDDB4D8C4940263E832A6D815CC06DF7D2E2E38B4940EF871643FA7F5CC0A0481885ED8B494087D8CE663E7F5CC0A174CDDB4D8C4940EC03F73ED97E5CC03D56629B5B8D494086616CFAC57E5CC0E12DFB3B9C914940D9624239D47E5CC0200A8610B093494052B8BCAAFB7D5CC0B54E9A76A49349406D734068007E5CC00654A2717E974940655419C6DD7D5CC0B323D5777E97494094FAB2B4537D5CC0541B9C887E9749403CA3AD4A227D5CC0541B9C887E974940E2ADF36F977C5CC0E3A7716F7E97494013F241CF667C5CC0E3A7716F7E97494048A30227DB7B5CC0132C0E677E97494015FE0C6FD67B5CC0132C0E677E974940CF7D763F727B5CC02FCC6F317E974940B07100A6847B5CC04E426A5DC193494083BE5437ED7D5CC0E79FDF18AE93494016527B68077B5CC016ABF53406924940B0454B4F247B5CC0483A2B557F91494016527B68077B5CC008EBA2C9008C494016527B68077B5CC09658125CB28449409CF65993117B5CC0ED524A46B284494049A3C00A117B5CC09004A615C78449404EABFF12537D5CC029621BD1B384494081D08F5EFC7C5CC0EF4687A4D7814940B0454B4F247B5CC0EF4687A4D78149408B3F0160237B5CC08636CE18FC8149406FFE37A0FD7A5CC09A21A2E7FA8149407C5EAB81EA7A5CC0B04F69C6197D49407A70E6A8F9795CC06874822E3874494014FA10BB467A5CC0CB663818CA72494018AAE515C87B5CC0FB9D038B827149404E15A5E7227D5CC0917759424E70494082929FE08C7D5CC024752548386D49402B0FFEAA897D5CC0F52A7881386D4940706C9F1C917D5CC0DB661CED276D4940CE55F31C917D5CC039D384ED276D49403EAF78EA917D5CC0D3D9C9E0286D4940207C28D1927D5CC02043C70E2A6D49401A8BA6B3937D5CC09C3061342B6D4940A226FA7C947D5CC049A297512C6D494001158E20957D5CC0B324404D2D6D4940EF8FF7AA957D5CC0DCB75A272E6D4940E99E758D967D5CC0D6C6D8092F6D494041B62C5F977D5CC0FF59F3E32F6D494077F700DD977D5CC03A58FFE7306D4940828B1535987D5CC0D55E44DB316D49404759BF99987D5CC0105D50DF326D49400B2769FE987D5CC0EB5223F4336D49402FFD4B52997D5CC0C748F608356D494052D32EA6997D5CC00247020D366D4940A52DAEF1997D5CC07F349C32376D4940B7989F1B9A7D5CC0D74B5304386D4940813D26529A7D5CC0D15AD1E6386D4940BD55D7A19A7D5CC07DCC07043A6D494010B056ED9A7D5CC0293E3E213B6D4940C2120F289B7D5CC0C34483143C6D494045F12A6B9B7D5CC0FF428F183D6D49401096B1A19B7D5CC0C8CD70033E6D4940AAB69BE09B7D5CC0753FA7203F6D49405D19541B9C7D5CC06E4E2503406D4940E0F76F5E9C7D5CC097E13FDD406D4940925A28999C7D5CC0207D93A6416D49405628D2FD9C7D5CC08BFF3BA2426D4940BBED42739D7D5CC0558A1D8D436D49409126DE019E7D5CC0D177B7B2446D49407FA1478C9E7D5CC0DCF126BF456D494055DAE21A9F7D5CC0D600A5A1466D49403D7E6FD39F7D5CC052EE3EC7476D49405B7D7555A07D5CC0BD70E7C2486D494048F8DEDFA07D5CC057772CB6496D4940728BF9B9A17D5CC0336DFFCA4A6D49402AABE97AA27D5CC0BC0853944B6D494041D3122BA37D5CC062BD512B4C6D4940DCF3FC69A37D5CC014200A664C6D49407CD11E2FA47D5CC08B506C054D6D494035F10EF0A47D5CC0618907944D6D494076C6F7C5A57D5CC019A9F7544E6D494016A4198BA67D5CC090D959F44E6D4940CEC3094CA77D5CC0378E588B4F6D4940B6679604A87D5CC06CCF2C09506D4940CD8FBFB4A87D5CC0D1949D7E506D4940153C855CA97D5CC0F46A80D2506D4940FCDF1115AA7D5CC089B48D3F516D4940CC41D0D1AA7D5CC0BEF561BD516D49409CA38E8EAB7D5CC0942EFD4B526D494054C37E4FAC7D5CC09AEB34D2526D4940F5A0A014AD7D5CC0A0A86C58536D49400CC9C9C4AD7D5CC034F279C5536D49408FA7E507AE7D5CC017D9CEF7536D4940EE9579ABAE7D5CC04C1AA375546D4940D6390664AF7D5CC052D7DAFB546D4940A69BC420B07D5CC0C8073D9B556D4940BDC3EDD0B07D5CC00FB40243566D49406F0C01C0B17D5CC07A36AB3E576D49409F76F86BB27D5CC044C18C29586D4940D4B7CCE9B27D5CC07FBF982D596D4940E04BE141B37D5CC0EA4141295A6D49401B649291B37D5CC054C4E9245B6D4940B6847CD0B37D5CC0603E59315C6D494027F8A6E9B37D5CC0DC2BF3565D6D4940158DB5BFB37D5CC047AE9B525E6D4940DA740470B37D5CC07041B62C5F6D4940FE648C0FB37D5CC0AB3FC230606D49407B8670CCB27D5CC016C26A2C616D49403997E2AAB27D5CC0213CDA38626D494057B08D78B27D5CC0EBC6BB23636D494057B08D78B27D5CC0F6402B30646D4940225514AFB27D5CC0313F3734656D49403F541A31B37D5CC02B4EB516666D4940CEC64ACCB37D5CC0C554FA09676D4940CDACA580B47D5CC00053060E686D49409D0E643DB57D5CC03B511212696D49403EEC8502B67D5CC047CB811E6A6D49407FC16ED8B67D5CC0115663096B6D49409012BBB6B77D5CC0AB5CA8FC6B6D494060747973B87D5CC016DF50F86C6D494072C5C551B97D5CC06FF607CA6D6D494012A3E716BA7D5CC0D4BB783F6E6D4940B28009DCBA7D5CC07A7077D66E6D49403B1C5DA5BB7D5CC0AFB14B546F6D4940ED647094BC7D5CC085EAE6E26F6D49405EBEF561BD7D5CC08BA71E69706D494057CD7344BE7D5CC0D253E410716D4940E068C70DBF7D5CC01900AAB8716D4940929735B1C07D5CC0EF384547726D494037FE4465C37D5CC0A167B3EA736D4940DC645419C67D5CC023128596756D49408D5F7825C97D5CC0289B7285776D49403F74417DCB7D5CC016FC36C4786D4940BA13ECBFCE7D5CC02733DE567A6D49405298F738D37D5CC08BC404357C6D4940B5C189E8D77D5CC09CFBABC77D6D49404E7ADFF8DA7D5CC078F17EDC7E6D494052B5DD04DF7D5CC0E8305F5E806D4940922232ACE27D5CC07689EAAD816D4940E9B7AF03E77D5CC0583CF548836D49406A1492CCEA7D5CC0E6948098846D494098309A95ED7D5CC03FAC376A856D494038F4160FEF7D5CC021938C9C856D4940D2E0B6B6F07D5CC0037AE1CE856D4940BA6A9E23F27D5CC07ADE8D05856D494066DCD440F37D5CC0992B836A836D49403067B62BF47D5CC0E23FDD40816D4940AD6EF59CF47D5CC0BFD18E1B7E6D4940E8A04B38F47D5CC08C2C9963796D4940AD6EF59CF47D5CC0D540F339776D4940F9BD4D7FF67D5CC0A7583508736D4940F29881CAF87D5CC0EAAF5758706D49400F7EE200FA7D5CC0C11C3D7E6F6D4940EE7A698A007E5CC06BD5AE09696D4940B69DB646047E5CC0C68844A1656D49407A51BB5F057E5CC0B5519D0E646D4940EA76F695077E5CC0CEE15AED616D4940D8D7BAD4087E5CC0227024D0606D494030BB270F0B7E5CC00A48FB1F606D494082AD122C0E7E5CC0E1B4E0455F6D4940747D1F0E127E5CC02995F0845E6D49406C2409C2157E5CC03B342C465D6D494036954561177E5CC08F8EAB915D6D49406ABC7493187E5CC03543AA285E6D49406D8FDE701F7E5CC0FE65F7E4616D4940486B0C3A217E5CC0B685E7A5626D49409B9141EE227E5CC085CD0017646D49409B6B5283277E5CC098F3087A666D494052B8BCAAFB7D5CC0BCC05FDC156E494055D236DA4C7F5CC059CEA9F2836F4940EFC506C1697F5CC0C3200992187149405694465CDD7F5CC0C6A428963972494057754E9D25805CC063B272ACA7734940F22A2E06D3805CC05F6C4326F671494059820B35CE805CC028D5CEFD3A70494027D4DD559D815CC0F4ED2E30017049408E2BBB8498815CC08CF3393E2D6F4940BF8E3B4EB1805CC08B5DDF12FD6E494057754E9D25805CC0BDEC1433766E4940234301BAD37F5CC0EE4F95FC8E6D4940F03C692DE27F5CC0B9A6E5ACC46C49401853598AC97F5CC0DB9B67DFC26C4940DADB362EE27F5CC02D6BEF07996C49401BD82AC1E27F5CC0DBA2CC06996C494096438B6CE77F5CC0AC1E300F996C4940FF05820019805CC0B1A71DFE9A6C49407A71E2AB1D805CC0938E72309B6C4940D520CCED5E805CC0B66455849B6C4940863DEDF0D7805CC02D95B7239C6C49400E4A9869FB805CC03F00A94D9C6C49401904560E2D815CC09E08E23C9C6C49404C0B6D3D60815CC07CD904C59C6C4940F356E35C33815CC0EC61D0239E6C49408E0CC3C5E0815CC02425FAA2B96E494060E2B4EAD0835CC0C7D0DDEC997249402EE9D9F587845CC09415F375C0724940FB9794537E845CC0C4B663BD48714940C8464FB174845CC059CEA9F2836F4940609707D5B8835CC0F295C482406F494093E84C77C2835CC088D9BF0EDC6D4940978A07A3AB835CC0BDB5F4729C6C4940D3A3A99ECC835CC0B073D3669C6C49407974232C2A845CC01B2AC6F99B6C4940F0C000C287845CC05D19541B9C6C49408524B37A87845CC0302FC03E3A6D4940009013268C845CC0302FC03E3A6D49402F14B01D8C845CC01EFE9AAC516D4940CB85CABF96845CC0EE79FEB4516D49408E05854199845CC0BEF561BD516D494051853FC39B845CC08F71C5C5516D49401405FA449E845CC02F698CD6516D494079B0C56E9F845CC02F698CD6516D4940F59D5F94A0845CC0D06053E7516D49405A492BBEA1845CC0A0DCB6EF516D494027C11BD2A8845CC0A699EE75526D494023BDA8DDAF845CC0828FC18A536D49407FC16ED8B6845CC034BE2F2E556D4940494C50C3B7845CC0E620E868556D494013D731AEB8845CC069FF03AC556D4940F4A3E194B9845CC0BC5983F7556D4940BE2EC37FBA845CC03F389F3A566D4940A0FB7266BB845CC092921E86566D494082C8224DBC845CC0E5EC9DD1566D4940C7D8092FC1845CC03080F0A1446D4940DBFCBFEAC8845CC0906B43C5386D49405DF8C1F9D4845CC0FB04508C2C6D4940EC87D860E1845CC0310C5872156D4940939048DBF8845CC0008E3D7B2E6D49406D3B6D8D08855CC011FFB0A5476D494030D80DDB16855CC042CD902A8A6D49401D39D21918855CC0516859F78F6D4940BB46CB811E855CC0516859F78F6D494039B69E211C855CC0871744A4A66D4940B9DE365321855CC0B6847CD0B36D49404F5C8E5720855CC07782FDD7B96D4940B85CFDD824855CC0A0FEB3E6C76D49407A71E2AB1D855CC00A9E42AED46D49401492CCEA1D855CC0CE548847E26D494022DFA5D425855CC0F7216FB9FA6D4940CA3505323B855CC0F29881CAF86D4940B05758703F855CC0876D8B321B6E49404E62105839855CC03885950A2A6E494018213CDA38855CC0CA32C4B12E6E4940897AC1A739855CC047718E3A3A6E49403927F6D03E855CC0BD732843556E4940D882DE1B43855CC0AAF1D24D626E4940E9D32AFA43855CC03F58C6866E6E4940111956F146855CC06D74CE4F716E4940730E9E094D855CC0AB933314776E4940282D5C5661855CC07C0F971C776E49403DB9A64066855CC07C0F971C776E49401137A79201865CC0BDFE243E776E494044DC9C4A06865CC0ED82C135776E49408CA2073E06865CC00D897B2C7D6E4940508A56EE05865CC09A081B9E5E6F4940D61EF64201865CC09A081B9E5E6F4940EE60C43E01865CC0118AADA0696F49401DE5603601865CC0740987DEE26F4940800EF3E505865CC0740987DEE26F4940D93F4F0306865CC0DA58897956704940800EF3E505865CC07B319413ED704940DF162CD505865CC0C6FD47A6437149406EA301BC05865CC02AE5B512BA7149406E895C7006865CC02AE5B512BA71494038143E5B07865CC02AE5B512BA71494050560C5707865CC0457F68E6C9714940676490BB08865CC04B766C04E2714940ADC266800B865CC0384BC97212724940A6D1E4620C865CC0384BC9721272494054E23AC615865CC068CF656A1272494088BB7A1519865CC0CF81E50819724940B56B425A63865CC02F8A1EF8187249400B7E1B62BC865CC0BE16F4DE1872494085E97B0DC1865CC0BE16F4DE187249405018946934875CC0ACAB02B5187249401D1EC2F869875CC01618B2BAD5714940B0CBF09F6E875CC0E69315C3D5714940C05DF6EB4E875CC0139B8F6B43714940F7578FFB56875CC0139B8F6B43714940D1E80E6267875CC0E316F37343714940D53DB2B96A875CC0E316F37343714940AE9AE7887C875CC0E316F3734371494034828DEBDF875CC0A2276552437149407C48F8DEDF875CC01F9F909DB7714940C901BB9A3C885CC06D3CD862B7714940C51B9947FE885CC037FB03E5B6714940DD5D6743FE885CC0B6BDDD921C724940A7CEA3E2FF885CC0B6BDDD921C724940A7CEA3E2FF885CC0393A01A72272494061DE8DCCE6885CC0718BDF7E23724940DFBC5F67F0885CC05CABC5991D764940247AA3820A895CC00D25FFBA1C76494012BC218D0A895CC0D5CDC5DFF676494012BC218D0A895CC0664D2CF015774940E33785950A895CC00D51853FC3774940CBF5B6990A895CC01B84B9DDCB774940832F4CA60A895CC0D7A4DB12B97849406CED7DAA0A895CC0B05582C5E17849406CED7DAA0A895CC0EDD808C4EB7849403C69E1B20A895CC09207228B34794940F5A276BF0A895CC0815A0C1EA6794940F5A276BF0A895CC0DE57E542E5794940F5A276BF0A895CC0FB230C03967A4940F5A276BF0A895CC0F9BB77D4987A4940F5A276BF0A895CC017F032C3467B4940F5A276BF0A895CC0637C98BD6C7B4940F5A276BF0A895CC021938C9C857B4940C51EDAC70A895CC05AD5928E727C49407D586FD40A895CC0F243A511337D49406616A1D80A895CC06493FC885F7D49406616A1D80A895CC0B41D5377657D49404442DF2A19895CC02D0EC6C1707D49404D55E24819895CC0B70D3AF17E7D49406BFFEF92FD885CC04BD993D8667D49409B36BB05B6875CC0AFF7FE18597C494031E45B6621865CC04981292BA67C494031E45B6621865CC0194A5EB8ED7D494030B8A60FC1855CC01E529DC02F8049406435A1082B865CC0B9077D29DD8049409848F62CC5865CC085F42705438049409AA060DA85875CC04FB51D8A487F494037AEAAF0F3885CC082700801227F4940EE4794DE1C895CC061BB55B2307F4940D36247FC1C895CC0B071FDBB3E7F49408E8F16670C895CC0B071FDBB3E7F4940A7052FFA0A895CC0B071FDBB3E7F4940A7052FFA0A895CC0A514747B497F4940A7052FFA0A895CC0C64E78094E7F4940A7052FFA0A895CC0C8073D9B557F4940A7052FFA0A895CC0199293895B7F49408FC360FE0A895CC096CE876709804940BF47FDF50A895CC0CFF57D384880494054ABAFAE0A895CC022C2BF081A81494079AEEFC341895CC0342DB1321A814940D0436D1B46895CC0342DB1321A814940E964A9F57E8A5CC05DC0CB0C1B814940E8305F5E808A5CC05DC0CB0C1B814940FF3EE3C2818A5CC05DC0CB0C1B8149408524B37A878A5CC02E3C2F151B814940BA6587F8878A5CC02E3C2F151B814940895FB1868B8A5CC02E3C2F151B814940BA4E232D958A5CC0FEB7921D1B8149402383DC45988A5CC0FEB7921D1B81494007EBFF1CE68A5CC0102384471B8149403C2EAA45448B5CC0228E75711B81494005A73E90BC8B5CC075E8F4BC1B814940350EC3FEFB8B5CC053473AE11B814940080199FE038C5CC0365A45DEAB814940809C0ECF208C5CC06F6793D48584494090FB4ED0BD8D5CC065E1DA3FAC8449407BEFDDA60A8E5CC074D646E31F8849400DDA206BC78D5CC0F14A4420008A494080323A71F78D5CC083CBB286938B49402212E9D827915CC0C21B5D475A8E4940F46B3A4C38915CC0E83B308C788E49402BA6D24F38915CC0E4BA29E5B58E49402BA6D24F38915CC0172CD505BC8E494042E8A04B38915CC0F8AA9509BF8E49402BA6D24F38915CC085ECBC8DCD8E49402BA6D24F38915CC09CFD8172DB8E49402BA6D24F38915CC0DA39CD02ED8E49404436902E36915CC0DA39CD02ED8E4940EA04341136915CC0938D075BEC8E4940799109F835915CC04CE141B3EB8E49402060ADDA35915CC005357C0BEB8E49404A41B79734915CC055A2EC2DE58E4940C896E5EB32915CC0E7FEEA71DF8E4940529ACDE330915CC02BBEA1F0D98E494018D00B772E915CC022E010AAD48E4940D27135B22B915CC06C5CFFAECF8E4940807F4A9528915CC009336DFFCA8E4940DB32E02C25915CC06BD784B4C68E4940E38BF67821915CC0C0CDE2C5C28E4940399CF9D51C915CC004594FADBE8E49406BD619DF17915CC08E90813CBB8E494002F04FA912915CC090F8156BB88E4940328E91EC11915CC06C223317B88E4940622CD32F11915CC0494C50C3B78E494092CA147310915CC025766D6FB78E4940001DE6CB0B915CC044C362D4B58E4940143E5B0707915CC098512CB7B48E494058E36C3A02915CC0F19C2D20B48E4940E44EE960FD905CC051A5660FB48E49408716D9CEF7905CC027DE019EB48E4940CBD58F4DF2905CC0E4BA29E5B58E4940394206F2EC905CC0BABF7ADCB78E494017A06D35EB905CC0A2630795B88E49402922C32ADE905CC010070951BE8E494054E6E61BD1905CC0DDB243FCC38E494066683C11C4905CC0AB5E7EA7C98E49402CB81FF0C0905CC0DAAED007CB8E4940C24F1C40BF905CC050DF32A7CB8E4940876BB587BD905CC0B5A4A31CCC8E494064C91CCBBB905CC03883BF5FCC8E4940B2666490BB905CC009FF2268CC8E4940FF03AC55BB905CC0D97A8670CC8E49404DA1F31ABB905CC0D97A8670CC8E49400CB265F9BA905CC0D97A8670CC8E4940B28009DCBA905CC0A9F6E978CC8E494071917BBABA905CC0A9F6E978CC8E49400D0055DCB8905CC0D97A8670CC8E4940912C6002B7905CC02618CE35CC8E4940FD169D2CB5905CC0C1525DC0CB8E4940397D3D5FB3905CC04B22FB20CB8E4940F8C1F9D4B1905CC093020B60CA8E494088821953B0905CC099F38C7DC98E4940B83A00E2AE905CC08E791D71C88E4940DD5ED218AD905CC02FA52E19C78E494031074147AB905CC0A14CA3C9C58E49409DF17D71A9905CC0B3EBDE8AC48E494005871744A4905CC062F9F36DC18E49405BB1BFEC9E905CC075CC79C6BE8E494070ECD97399905CC0BDE0D39CBC8E4940BCEA01F390905CC074EFE192E38E49400806103E94905CC002486DE2E48E4940B329577897905CC0137F1475E68E4940ECD973999A905CC0488C9E5BE88E4940994BAAB69B905CC000AC8E1CE98E494074417DCB9C905CC0B8CB7EDDE98E4940503750E09D905CC011E335AFEA8E4940A7E67283A1905CC02D944C4EED8E494011018750A5905CC056F31C91EF8E4940D34CF73AA9905CC0BA84436FF18E4940D76D50FBAD905CC00DAB7823F38E494033C005D9B2905CC0B91CAF40F48E4940310A82C7B7905CC08F554ACFF48E49402E54FEB5BC905CC0BED9E6C6F48E4940E4D70FB1C1905CC048A98427F48E4940FA635A9BC6905CC0FB3F87F9F28E4940B6BE4868CB905CC008228B34F18E4940D82C978DCE905CC0D9D138D4EF8E4940C5AA4198DB905CC00B26FE28EA8E49409BE61DA7E8905CC06DFE5F75E48E4940CC09DAE4F0905CC0B74604E3E08E4940CC09DAE4F0905CC0BE88B663EA8E4940CC09DAE4F0905CC0D61EF642018F4940CC09DAE4F0905CC0BDC282FB018F4940CC09DAE4F0905CC008AD872F138F4940B4C70BE9F0905CC00BB77C24258F4940B4C70BE9F0905CC03D450E11378F4940B4C70BE9F0905CC09F7422C1548F4940B4C70BE9F0905CC0494A7A185A8F4940E4BCFF8F13915CC019C6DD205A8F49402CF4C13236915CC0EA4141295A8F49401364045438915CC0EA4141295A8F4940FB21365838915CC0E8305F5E808F4940FB21365838915CC0210725CCB48F49402CF4C13236915CC0210725CCB48F4940D80E46EC13915CC0210725CCB48F4940D828EB3713915CC0210725CCB48F49409D853DEDF0905CC0210725CCB48F494085436FF1F0905CC0DC476E4DBA8F494085436FF1F0905CC00EF3E505D88F494085436FF1F0905CC011FDDAFAE98F49406D01A1F5F0905CC01407D0EFFB8F49406D01A1F5F0905CC0D1AFAD9FFE8F4940221ADD41EC905CC0D1AFAD9FFE8F49403A5CAB3DEC905CC01407D0EFFB8F49403A5CAB3DEC905CC0E4486760E48F4940529E7939EC905CC08AAC3594DA8F4940529E7939EC905CC0978E39CFD88F4940529E7939EC905CC095D5743DD18F4940529E7939EC905CC0DE0033DFC18F4940122EE411DC905CC0DE0033DFC18F4940122EE411DC905CC0508BC1C3B48F49404EF2237EC5905CC0508BC1C3B48F494033A6608DB3905CC0508BC1C3B48F4940309C6B98A1905CC0508BC1C3B48F49401650A8A78F905CC0508BC1C3B48F49401346B3B27D905CC0800F5EBBB48F49401346B3B27D905CC03AADDBA0F68F4940FB03E5B67D905CC0730F09DFFB8F4940FB03E5B67D905CC030B8E68EFE8F4940FB03E5B67D905CC0F1811DFF05904940F660527C7C905CC0F1811DFF059049409758198D7C905CC060394206F29049409758198D7C905CC0800BB265F990494067D47C957C905CC04698A25C1A9149404F92AE997C905CC03A58FFE7309149403750E09D7C905CC083DA6FED449149403750E09D7C905CC0D3307C444C9149401F0E12A27C905CC023A46E675F914940F08975AA7C905CC0B8ACC26680914940F08975AA7C905CC0488AC8B08A914940D847A7AE7C905CC07E39B35DA191494091813CBB7C905CC063B5F97FD591494091813CBB7C905CC0643A747ADE914940D847A7AE7C905CC00B96EA025E924940D847A7AE7C905CC061C614AC71924940D847A7AE7C905CC0F660527C7C92494008CC43A67C905CC0BC95253ACB924940317903CC7C905CC0662FDB4E5B934940193735D07C905CC026C5C72764934940A2EC2DE57C905CC097033DD4B6934940A2EC2DE57C905CC00D349F73B7934940A2EC2DE57C905CC08D429259BD9349403A2009FB76905CC05EBEF561BD934940927538BA4A905CC02E3A596ABD9349400B7E1B62BC8F5CC0CF31207BBD9349406553AEF02E8F5CC016DEE522BE9349401E537765178F5CC08751103CBE934940EE940ED6FF8E5CC0F8C43A55BE934940A7CEA3E2FF8E5CC0AA9B8BBFED93494022469DE5FF8E5CC005BE2AC1F793494005000000E80875CE3F7D5CC042218075A3794940E80875CE3F7D5CC06EA8768DDA764940177E30BF677B5CC06EA8768DDA7649404ACF7561717B5CC042218075A3794940E80875CE3F7D5CC042218075A37949401000000037AEAAF0F3885CC07000E13A9B774940BDD9E863C9805CC03109C35CDD72494089C6933F2F805CC06748CDD7D773494054B33E1B957F5CC036E54C0EBF744940203644222B7F5CC039696C12E075494020CC9E4D5B7F5CC00806EC48C776494055DFF371F57F5CC03E71AB1A227849408A88A3C1BF805CC0A513365F357849402350BE517C805CC06EA8768DDA764940EEA60E02B27F5CC00582CC44A675494055754E9D25805CC0371102651F754940BE6F438FF9805CC001D2F7E924744940F3AE4D0AF4815CC0045617EE4575494090263DF531835CC03BED8B1601774940CA41D1210E865CC0D7CE20D60E78494037AEAAF0F3885CC07000E13A9B7749400F0000009993A342DD865CC01327D630E59049400224F35FE1875CC0DFD5908EDB90494036EC9A6E63885CC045B60B515E9049400331B0F789885CC0AA968613E18F4940D0DF6A5580885CC0A83E1C66208F49409EBADA09D7885CC0D80B4204098E49409CAD1D722E885CC0D7B3D756488D49409974AB8325875CC03A3CE86B0A8C494064EAF3F212865CC005299347708B4940CA41D1210E865CC009430D77C18C4940C9151CCBAD855CC071A7A73D658D4940C834148A65855CC00B31D24FB28D49406292894552855CC073956C16568E4940C9CA6EB595855CC0A83E1C66208F49409993A342DD865CC01327D630E5904940', 
	'Calgary', 'Canada');
