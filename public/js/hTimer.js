//var deadline = 'Dec 31 2020 00:00:00 GMT-0400';
var waktu = new Date();
var durasi = parseInt(kelas.durasi || 10);
console.log(durasi);
var deadline = waktu.setMinutes( waktu.getMinutes() + durasi);
function sisa_waktu(_waktuBerakhir){
	var t = _waktuBerakhir - Date.parse(new Date());
	var detik = Math.floor( (t/1000) % 60 );
	var menit = Math.floor( (t/1000/60) % 60 );
	var jam = Math.floor( (t/(1000*60*60)) % 24 );
	var hari = Math.floor( t/(1000*60*60*24) );
	return {'total':t, 'hari':hari, 'jam':jam, 'menit':menit, 'detik':detik};
}
function run_clock(id,_waktuBerakhir){
	var waktu = document.getElementById(id);
				
	// get spans where our clock numbers are held
	var hari_span = waktu.querySelector('.hari');
	var jam_span = waktu.querySelector('.jam');
	var menit_span = waktu.querySelector('.menit');
	var detik_span = waktu.querySelector('.detik');

	function update_clock(){
		var t = sisa_waktu(_waktuBerakhir);
		
		// update the numbers in each part of the clock
		hari_span.innerHTML = t.hari;
		jam_span.innerHTML = ('0' + t.jam).slice(-2);
		menit_span.innerHTML = ('0' + t.menit).slice(-2);
		detik_span.innerHTML = ('0' + t.detik).slice(-2);
		
		if(t.total<=0){ clearInterval(timeinterval); }
		}
	update_clock();
	var timeinterval = setInterval(update_clock,1000);
}
//run_clock('clockdiv',deadline);