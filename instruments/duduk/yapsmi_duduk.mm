<map version="freeplane 1.7.0">
<!--To view this file, download free mind mapping software Freeplane from http://freeplane.sourceforge.net -->
<node TEXT="duduk.html" FOLDED="false" ID="ID_409619125" CREATED="1718795472818" MODIFIED="1718797410020" STYLE="oval">
<font SIZE="18"/>
<hook NAME="MapStyle" zoom="1.61">
    <properties edgeColorConfiguration="#808080ff,#ff0000ff,#0000ffff,#00ff00ff,#ff00ffff,#00ffffff,#7c0000ff,#00007cff,#007c00ff,#7c007cff,#007c7cff,#7c7c00ff" fit_to_viewport="false"/>

<map_styles>
<stylenode LOCALIZED_TEXT="styles.root_node" STYLE="oval" UNIFORM_SHAPE="true" VGAP_QUANTITY="24.0 pt">
<font SIZE="24"/>
<stylenode LOCALIZED_TEXT="styles.predefined" POSITION="right" STYLE="bubble">
<stylenode LOCALIZED_TEXT="default" ICON_SIZE="12.0 pt" COLOR="#000000" STYLE="fork">
<font NAME="SansSerif" SIZE="10" BOLD="false" ITALIC="false"/>
</stylenode>
<stylenode LOCALIZED_TEXT="defaultstyle.details"/>
<stylenode LOCALIZED_TEXT="defaultstyle.attributes">
<font SIZE="9"/>
</stylenode>
<stylenode LOCALIZED_TEXT="defaultstyle.note" COLOR="#000000" BACKGROUND_COLOR="#ffffff" TEXT_ALIGN="LEFT"/>
<stylenode LOCALIZED_TEXT="defaultstyle.floating">
<edge STYLE="hide_edge"/>
<cloud COLOR="#f0f0f0" SHAPE="ROUND_RECT"/>
</stylenode>
</stylenode>
<stylenode LOCALIZED_TEXT="styles.user-defined" POSITION="right" STYLE="bubble">
<stylenode LOCALIZED_TEXT="styles.topic" COLOR="#18898b" STYLE="fork">
<font NAME="Liberation Sans" SIZE="10" BOLD="true"/>
</stylenode>
<stylenode LOCALIZED_TEXT="styles.subtopic" COLOR="#cc3300" STYLE="fork">
<font NAME="Liberation Sans" SIZE="10" BOLD="true"/>
</stylenode>
<stylenode LOCALIZED_TEXT="styles.subsubtopic" COLOR="#669900">
<font NAME="Liberation Sans" SIZE="10" BOLD="true"/>
</stylenode>
<stylenode LOCALIZED_TEXT="styles.important">
<icon BUILTIN="yes"/>
</stylenode>
</stylenode>
<stylenode LOCALIZED_TEXT="styles.AutomaticLayout" POSITION="right" STYLE="bubble">
<stylenode LOCALIZED_TEXT="AutomaticLayout.level.root" COLOR="#000000" STYLE="oval" SHAPE_HORIZONTAL_MARGIN="10.0 pt" SHAPE_VERTICAL_MARGIN="10.0 pt">
<font SIZE="18"/>
</stylenode>
<stylenode LOCALIZED_TEXT="AutomaticLayout.level,1" COLOR="#0033ff">
<font SIZE="16"/>
</stylenode>
<stylenode LOCALIZED_TEXT="AutomaticLayout.level,2" COLOR="#00b439">
<font SIZE="14"/>
</stylenode>
<stylenode LOCALIZED_TEXT="AutomaticLayout.level,3" COLOR="#990000">
<font SIZE="12"/>
</stylenode>
<stylenode LOCALIZED_TEXT="AutomaticLayout.level,4" COLOR="#111111">
<font SIZE="10"/>
</stylenode>
<stylenode LOCALIZED_TEXT="AutomaticLayout.level,5"/>
<stylenode LOCALIZED_TEXT="AutomaticLayout.level,6"/>
<stylenode LOCALIZED_TEXT="AutomaticLayout.level,7"/>
<stylenode LOCALIZED_TEXT="AutomaticLayout.level,8"/>
<stylenode LOCALIZED_TEXT="AutomaticLayout.level,9"/>
<stylenode LOCALIZED_TEXT="AutomaticLayout.level,10"/>
<stylenode LOCALIZED_TEXT="AutomaticLayout.level,11"/>
</stylenode>
</stylenode>
</map_styles>
</hook>
<hook NAME="AutomaticEdgeColor" COUNTER="14" RULE="ON_BRANCH_CREATION"/>
<node TEXT="tools.js" POSITION="right" ID="ID_1035717063" CREATED="1718795519780" MODIFIED="1718795522630">
<edge COLOR="#0000ff"/>
</node>
<node TEXT="knobs.js (version fixe)" POSITION="right" ID="ID_1677949169" CREATED="1718795482848" MODIFIED="1718797462498">
<edge COLOR="#ff0000"/>
</node>
<node TEXT="plugin.js" POSITION="right" ID="ID_1395306590" CREATED="1718797382505" MODIFIED="1718797386511">
<edge COLOR="#00ff00"/>
</node>
<node TEXT="init.js" POSITION="right" ID="ID_917747731" CREATED="1718795531987" MODIFIED="1718795535366">
<edge COLOR="#ff00ff"/>
<node TEXT="duduk.js" ID="ID_949720750" CREATED="1718795578773" MODIFIED="1718795584344">
<node TEXT="wind_instrument.js" ID="ID_1116812585" CREATED="1718795646018" MODIFIED="1718795673587">
<node TEXT="instrument.js" ID="ID_127496909" CREATED="1718795662544" MODIFIED="1718795669945"/>
<node TEXT="rk4.js" ID="ID_1792184336" CREATED="1718795675535" MODIFIED="1718795678225"/>
</node>
</node>
<node TEXT="audio.js" ID="ID_1440771311" CREATED="1718795585861" MODIFIED="1718795588825">
<node TEXT="yin.js" ID="ID_1648854092" CREATED="1718795617669" MODIFIED="1718795622089"/>
<node TEXT="fft.js" ID="ID_523148232" CREATED="1718795623252" MODIFIED="1718795626744"/>
</node>
</node>
<node TEXT="duduk-ui.js" POSITION="right" ID="ID_1050920564" CREATED="1718795537300" MODIFIED="1718795541160">
<edge COLOR="#00ffff"/>
</node>
<node TEXT="plugins" POSITION="left" ID="ID_1840395350" CREATED="1718795524163" MODIFIED="1718797440895">
<edge COLOR="#00ff00"/>
<node TEXT="controls" ID="ID_750557466" CREATED="1718796126917" MODIFIED="1718796142988">
<node TEXT="keyboard (todo)" ID="ID_603094323" CREATED="1718796160709" MODIFIED="1718796166601"/>
<node TEXT="formula (todo)" ID="ID_1694203296" CREATED="1718796167093" MODIFIED="1718796170361"/>
<node TEXT="pad" ID="ID_1726354791" CREATED="1718796170933" MODIFIED="1718796175094"/>
<node TEXT="midi" ID="ID_589006889" CREATED="1718796176101" MODIFIED="1718796177240"/>
</node>
<node TEXT="analysis" ID="ID_668515401" CREATED="1718796143490" MODIFIED="1718796148605">
<node TEXT="spectrogram (todo)" ID="ID_1604946373" CREATED="1718796184341" MODIFIED="1718796199928"/>
<node TEXT="levels (todo)" ID="ID_202397753" CREATED="1718796200688" MODIFIED="1718796204104"/>
<node TEXT="waveform (to complete)" ID="ID_1395533784" CREATED="1718796205844" MODIFIED="1718796210664"/>
<node TEXT="record (almost done)" ID="ID_633495615" CREATED="1718796211349" MODIFIED="1718796227606"/>
<node TEXT="colino_2d" ID="ID_19397829" CREATED="1718796229220" MODIFIED="1718796233253"/>
<node TEXT="colino_3d" ID="ID_14375882" CREATED="1718796233779" MODIFIED="1718796236163"/>
<node TEXT="timbre (???)" ID="ID_665150785" CREATED="1718796245508" MODIFIED="1718796248629"/>
</node>
<node TEXT="effetcs" ID="ID_346111442" CREATED="1718796149077" MODIFIED="1718796153350">
<node TEXT="equaliser (todo)" ID="ID_1906732317" CREATED="1718796260195" MODIFIED="1718796263799"/>
<node TEXT="waveshaper" ID="ID_1816312979" CREATED="1718796264948" MODIFIED="1718796269782"/>
<node TEXT="reverb" ID="ID_405035507" CREATED="1718796272787" MODIFIED="1718796274486"/>
<node TEXT="radiate" ID="ID_1708152577" CREATED="1718796276035" MODIFIED="1718796277942"/>
<node TEXT="compressor" ID="ID_1581089095" CREATED="1718796278418" MODIFIED="1718796280614"/>
</node>
</node>
</node>
</map>
